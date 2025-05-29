import React, { useState } from 'react';
import useFundingStore, { useFundingActions } from '../store/fundingStore';
import { mockWithdrawAsset } from '../services/hydroService';
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

const WithdrawAssetForm = () => {
  const fundingAssets = useFundingStore((state) => state.fundingAssets);
  const { withdrawAsset: storeWithdrawAsset } = useFundingActions(); // Renamed for clarity

  const [selectedAssetTicker, setSelectedAssetTicker] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const suppliedAssets = fundingAssets.filter(a => parseFloat(a.userSupplied) > 0);

  const handleAssetChange = (event) => {
    setSelectedAssetTicker(event.target.value);
    setFeedback('');
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

    const assetToWithdraw = fundingAssets.find(a => a.asset === selectedAssetTicker);
    if (!assetToWithdraw || numericAmount > parseFloat(assetToWithdraw.userSupplied)) {
      setFeedback(`Insufficient supplied balance. You have supplied ${assetToWithdraw?.userSupplied || 0} ${selectedAssetTicker}.`);
      return;
    }

    setIsSubmitting(true);
    setFeedback(`Withdrawing ${amount} ${selectedAssetTicker}...`);

    const result = await mockWithdrawAsset(selectedAssetTicker, amount);

    if (result.success) {
      const storeUpdateSuccess = storeWithdrawAsset(selectedAssetTicker, amount);
      if (storeUpdateSuccess) {
        setFeedback(result.message + ` Tx (mock): ${result.transactionHash_mock}`);
        setAmount(''); // Clear amount
      } else {
        // This might happen if, for some reason, the store logic prevents withdrawal after service success
        setFeedback('Withdrawal successful (service), but failed to update store state or insufficient funds in store.');
      }
    } else {
      setFeedback(`Error: ${result.message}`);
    }
    setIsSubmitting(false);
  };
  
  const selectedAssetDetails = fundingAssets.find(a => a.asset === selectedAssetTicker);

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2 }}> {/* Added margin top for spacing if stacked */}
      <Typography variant="h6" gutterBottom>Withdraw Assets</Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel id="withdraw-asset-select-label">Asset</InputLabel>
        <Select
          labelId="withdraw-asset-select-label"
          value={selectedAssetTicker}
          label="Asset"
          onChange={handleAssetChange}
          disabled={suppliedAssets.length === 0}
        >
          <MenuItem value=""><em>Select Asset to Withdraw</em></MenuItem>
          {suppliedAssets.map((asset) => (
            <MenuItem key={asset.asset} value={asset.asset}>
              {asset.asset} (Supplied: {asset.userSupplied})
            </MenuItem>
          ))}
        </Select>
        {suppliedAssets.length === 0 && <FormHelperText>You have no assets supplied to withdraw.</FormHelperText>}
      </FormControl>

      {selectedAssetDetails && (
         <Typography variant="caption" display="block" gutterBottom sx={{mt: 1}}>
          Currently Supplied: {selectedAssetDetails.userSupplied} {selectedAssetDetails.asset}
        </Typography>
      )}

      <TextField
        label="Amount to Withdraw"
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
        color="primary"
        onClick={handleSubmit}
        disabled={isSubmitting || !selectedAssetTicker || !amount}
        fullWidth
        sx={{ mt: 1 }}
      >
        {isSubmitting ? <CircularProgress size={24} /> : `Withdraw ${selectedAssetTicker || 'Asset'}`}
      </Button>

      {feedback && (
        <FormHelperText sx={{ mt: 2, color: feedback.startsWith('Error') || feedback.startsWith('Insufficient') ? 'error.main' : 'success.main' }}>
          {feedback}
        </FormHelperText>
      )}
    </Paper>
  );
};

export default WithdrawAssetForm;
