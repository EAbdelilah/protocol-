import React, { useState, useEffect } from 'react';
import useFundingStore, { useFundingActions, mockWalletBalances } from '../store/fundingStore';
import { mockRepayAsset } from '../services/hydroService';
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
  FormHelperText
} from '@mui/material';

const RepayAssetForm = ({ assetToRepay: preselectedAsset }) => {
  const { fundingAssets } = useFundingStore((state) => ({
    fundingAssets: state.fundingAssets,
  }));
  const { repayAsset: storeRepayAsset } = useFundingActions();

  const [selectedAssetTicker, setSelectedAssetTicker] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const borrowedAssets = fundingAssets.filter(a => parseFloat(a.userBorrowed) > 0);

  useEffect(() => {
    if (preselectedAsset && borrowedAssets.find(a => a.asset === preselectedAsset)) {
      setSelectedAssetTicker(preselectedAsset);
    } else if (borrowedAssets.length > 0 && !preselectedAsset) {
      // Optionally default to the first borrowed asset if no preselection
      // setSelectedAssetTicker(borrowedAssets[0].asset);
    } else {
        setSelectedAssetTicker(''); // Clear if preselected is not borrowed or no borrowed assets
    }
  }, [preselectedAsset, fundingAssets]); // Rerun if fundingAssets changes (e.g. a borrow is paid off)


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

    const walletBalance = parseFloat(mockWalletBalances[selectedAssetTicker] || '0');
    if (numericAmount > walletBalance) {
      setFeedback(`Insufficient wallet balance to repay. You have ${walletBalance} ${selectedAssetTicker}.`);
      return;
    }
    
    const assetToRepayDetails = fundingAssets.find(a => a.asset === selectedAssetTicker);
    if (numericAmount > parseFloat(assetToRepayDetails?.userBorrowed || '0')) {
        setFeedback(`Repay amount exceeds your borrowed amount of ${assetToRepayDetails?.userBorrowed || '0'} ${selectedAssetTicker}.`);
        return;
    }


    setIsSubmitting(true);
    setFeedback(`Repaying ${amount} ${selectedAssetTicker}...`);

    const result = await mockRepayAsset(selectedAssetTicker, amount);

    if (result.success) {
      const storeUpdateSuccess = storeRepayAsset(selectedAssetTicker, amount);
      if (storeUpdateSuccess) {
        setFeedback(result.message + ` Tx (mock): ${result.transactionHash_mock}`);
        setAmount(''); 
      } else {
        setFeedback('Repay successful (service), but failed to update store state (e.g. insufficient wallet balance in store).');
      }
    } else {
      setFeedback(`Error: ${result.message}`);
    }
    setIsSubmitting(false);
  };
  
  const selectedAssetDetails = fundingAssets.find(a => a.asset === selectedAssetTicker);

  return (
    <Paper elevation={2} sx={{ p: 2, mt:2 }}> {/* Added margin top for consistency if stacked */}
      <Typography variant="h6" gutterBottom>Repay Borrows</Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel id="repay-asset-select-label">Asset to Repay</InputLabel>
        <Select
          labelId="repay-asset-select-label"
          value={selectedAssetTicker}
          label="Asset to Repay"
          onChange={handleAssetChange}
          disabled={borrowedAssets.length === 0}
        >
          <MenuItem value=""><em>Select Asset</em></MenuItem>
          {borrowedAssets.map((asset) => (
            <MenuItem key={asset.asset} value={asset.asset}>
              {asset.asset} (Borrowed: {asset.userBorrowed})
            </MenuItem>
          ))}
        </Select>
        {borrowedAssets.length === 0 && <FormHelperText>You have no outstanding borrows to repay.</FormHelperText>}
      </FormControl>

      {selectedAssetDetails && (
        <Box sx={{my:1}}>
            <Typography variant="caption" display="block">
            Outstanding Borrow: {selectedAssetDetails.userBorrowed} {selectedAssetDetails.asset} (${selectedAssetDetails.userBorrowedUsd} USD)
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
            Wallet Balance: {mockWalletBalances[selectedAssetTicker] || '0'} {selectedAssetTicker}
            </Typography>
        </Box>
      )}

      <TextField
        label="Amount to Repay"
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
        color="secondary" // Or primary
        onClick={handleSubmit}
        disabled={isSubmitting || !selectedAssetTicker || !amount}
        fullWidth
        sx={{ mt: 1 }}
      >
        {isSubmitting ? <CircularProgress size={24} /> : `Repay ${selectedAssetTicker || 'Asset'}`}
      </Button>

      {feedback && (
        <FormHelperText sx={{ mt: 2, color: feedback.startsWith('Error') || feedback.startsWith('Insufficient') ? 'error.main' : 'primary.main' }}>
          {feedback}
        </FormHelperText>
      )}
    </Paper>
  );
};

export default RepayAssetForm;
