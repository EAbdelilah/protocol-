import React, { useState } from 'react';
import useFundingStore, { useFundingActions, mockWalletBalances } from '../store/fundingStore';
import { mockSupplyAsset } from '../services/hydroService';
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

const SupplyAssetForm = () => {
  const fundingAssets = useFundingStore((state) => state.fundingAssets);
  const { supplyAsset: storeSupplyAsset } = useFundingActions(); // Renamed to avoid conflict
  
  const [selectedAssetTicker, setSelectedAssetTicker] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleAssetChange = (event) => {
    setSelectedAssetTicker(event.target.value);
    setFeedback(''); // Clear feedback when asset changes
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
      setFeedback(`Insufficient wallet balance. You have ${walletBalance} ${selectedAssetTicker}.`);
      return;
    }

    setIsSubmitting(true);
    setFeedback(`Supplying ${amount} ${selectedAssetTicker}...`);

    const result = await mockSupplyAsset(selectedAssetTicker, amount);

    if (result.success) {
      // Update store after successful mock service call
      const storeUpdateSuccess = storeSupplyAsset(selectedAssetTicker, amount);
      if (storeUpdateSuccess) {
        setFeedback(result.message + ` Tx (mock): ${result.transactionHash_mock}`);
        setAmount(''); // Clear amount after successful supply
      } else {
        // This case should ideally not happen if mock service succeeds
        setFeedback('Supply successful (service), but failed to update store state.');
      }
    } else {
      setFeedback(`Error: ${result.message}`);
    }
    setIsSubmitting(false);
  };
  
  const selectedAssetDetails = fundingAssets.find(a => a.asset === selectedAssetTicker);

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Supply Assets</Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel id="supply-asset-select-label">Asset</InputLabel>
        <Select
          labelId="supply-asset-select-label"
          value={selectedAssetTicker}
          label="Asset"
          onChange={handleAssetChange}
        >
          <MenuItem value=""><em>Select Asset</em></MenuItem>
          {fundingAssets.map((asset) => (
            <MenuItem key={asset.asset} value={asset.asset}>
              {asset.asset} (APY: {asset.supplyApy})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedAssetTicker && (
        <Typography variant="caption" display="block" gutterBottom sx={{mt: 1}}>
          Wallet Balance: {mockWalletBalances[selectedAssetTicker] || '0'} {selectedAssetTicker}
        </Typography>
      )}

      <TextField
        label="Amount to Supply"
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
        {isSubmitting ? <CircularProgress size={24} /> : `Supply ${selectedAssetTicker || 'Asset'}`}
      </Button>

      {feedback && (
        <FormHelperText sx={{ mt: 2, color: feedback.startsWith('Error') || feedback.startsWith('Insufficient') ? 'error.main' : 'success.main' }}>
          {feedback}
        </FormHelperText>
      )}
    </Paper>
  );
};

export default SupplyAssetForm;
