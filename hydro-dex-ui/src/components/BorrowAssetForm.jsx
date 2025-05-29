import React, { useState, useEffect } from 'react';
import useFundingStore, { useFundingActions } from '../store/fundingStore';
import { mockBorrowAsset } from '../services/hydroService';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Paper,
  CircularProgress,
  FormHelperText,
  Grid
} from '@mui/material';

const BorrowAssetForm = ({ assetToBorrow: preselectedAsset }) => {
  const { fundingAssets, userSummary } = useFundingStore((state) => ({
    fundingAssets: state.fundingAssets,
    userSummary: state.userSummary,
  }));
  const { borrowAsset: storeBorrowAsset } = useFundingActions();

  const [selectedAssetTicker, setSelectedAssetTicker] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [availableToBorrowUsd, setAvailableToBorrowUsd] = useState(0);

  useEffect(() => {
    if (preselectedAsset) {
      setSelectedAssetTicker(preselectedAsset);
    }
  }, [preselectedAsset]);
  
  useEffect(() => {
    // Calculate available to borrow in USD (simplified mock)
    // Max borrow = (Total Supplied USD * Weighted Avg Collateral Factor) - Total Borrowed USD
    // For this mock, let's use a simplified version based on total collateral and existing borrows.
    // A more accurate calculation would be asset-specific based on available liquidity and user's specific collateral.
    const totalCollateralValue = fundingAssets.reduce((sum, asset) => {
        if (asset.canBeCollateral && parseFloat(asset.userSuppliedUsd) > 0) {
            return sum + (parseFloat(asset.userSuppliedUsd) * (parseFloat(asset.collateralFactor) / 100));
        }
        return sum;
    }, 0);
    const newAvailableToBorrow = totalCollateralValue - parseFloat(userSummary.totalBorrowedUsd);
    setAvailableToBorrowUsd(newAvailableToBorrow > 0 ? newAvailableToBorrow : 0);

  }, [fundingAssets, userSummary.totalBorrowedUsd]);


  const handleAssetChange = (event) => {
    setSelectedAssetTicker(event.target.value);
    setFeedback('');
    setAmount('');
  };

  const handleSubmit = async () => {
    if (!selectedAssetTicker || !amount) {
      setFeedback('Please select an asset and enter an amount.');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (numericAmount <= 0) {
      setFeedback('Amount must be greater than zero.');
      return;
    }
    
    // Mock: Check against availableToBorrowUsd (very simplified)
    const selectedAssetPrice = useFundingStore.getState().fundingAssets.find(a => a.asset === selectedAssetTicker)?.price || 1; // Assume price 1 if not found for mock
    if ((numericAmount * selectedAssetPrice) > availableToBorrowUsd) {
        setFeedback(`Borrow amount exceeds your available borrow limit of approx. $${availableToBorrowUsd.toFixed(2)}.`);
        return;
    }


    setIsSubmitting(true);
    setFeedback(`Borrowing ${amount} ${selectedAssetTicker}...`);

    const result = await mockBorrowAsset(selectedAssetTicker, amount);

    if (result.success) {
      const storeUpdateSuccess = storeBorrowAsset(selectedAssetTicker, amount);
      if (storeUpdateSuccess) {
        setFeedback(result.message + ` Tx (mock): ${result.transactionHash_mock}`);
        setAmount(''); 
      } else {
        setFeedback('Borrow successful (service), but failed to update store state.');
      }
    } else {
      setFeedback(`Error: ${result.message}`);
    }
    setIsSubmitting(false);
  };
  
  const selectedAssetDetails = fundingAssets.find(a => a.asset === selectedAssetTicker);

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Borrow Assets</Typography>
      <Grid container spacing={1} sx={{mb:2}}>
        <Grid item xs={6}>
            <Typography variant="body2">Total Collateral Value:</Typography>
            <Typography variant="body1" fontWeight="bold">${userSummary.totalSuppliedUsd}</Typography> 
        </Grid>
         <Grid item xs={6}>
            <Typography variant="body2">Available to Borrow (Approx.):</Typography>
            <Typography variant="body1" fontWeight="bold" color={availableToBorrowUsd > 0 ? 'text.primary' : 'error.main'}>
                ${availableToBorrowUsd.toFixed(2)}
            </Typography>
        </Grid>
      </Grid>
      <FormControl fullWidth margin="normal">
        <InputLabel id="borrow-asset-select-label">Asset to Borrow</InputLabel>
        <Select
          labelId="borrow-asset-select-label"
          value={selectedAssetTicker}
          label="Asset to Borrow"
          onChange={handleAssetChange}
        >
          <MenuItem value=""><em>Select Asset</em></MenuItem>
          {fundingAssets.map((asset) => (
            // Typically, you can borrow any asset listed, regardless of whether you supplied it,
            // as long as you have enough collateral.
            <MenuItem key={asset.asset} value={asset.asset}>
              {asset.asset} (APY: {asset.borrowApy})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedAssetDetails && (
        <Box sx={{my:1}}>
        <Typography variant="caption" display="block">
          Currently Borrowed: {selectedAssetDetails.userBorrowed} {selectedAssetDetails.asset} 
          (${selectedAssetDetails.userBorrowedUsd} USD)
        </Typography>
        <Typography variant="caption" display="block">
          Asset Liquidity: {selectedAssetDetails.liquidity}
        </Typography>
        </Box>
      )}

      <TextField
        label="Amount to Borrow"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        fullWidth
        margin="normal"
        variant="outlined"
        disabled={!selectedAssetTicker}
      />
      
      <Button
        variant="contained"
        color="secondary" // Changed color for Borrow
        onClick={handleSubmit}
        disabled={isSubmitting || !selectedAssetTicker || !amount || availableToBorrowUsd <=0}
        fullWidth
        sx={{ mt: 1 }}
      >
        {isSubmitting ? <CircularProgress size={24} /> : `Borrow ${selectedAssetTicker || 'Asset'}`}
      </Button>

      {feedback && (
        <FormHelperText sx={{ mt: 2, color: feedback.startsWith('Error') ? 'error.main' : 'primary.main' }}>
          {feedback}
        </FormHelperText>
      )}
    </Paper>
  );
};

export default BorrowAssetForm;
