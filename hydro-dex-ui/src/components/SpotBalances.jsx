import React from 'react';
import useMarketStore, { mockBalances } from '../store/marketStore';
import { Typography, Box, Paper } from '@mui/material';

const SpotBalances = () => {
  const selectedPair = useMarketStore((state) => state.selectedPair);

  if (!selectedPair) {
    return <Typography>No trading pair selected.</Typography>;
  }

  const baseAsset = selectedPair.base;
  const quoteAsset = selectedPair.quote;

  const baseBalance = mockBalances[baseAsset] || '0';
  const quoteBalance = mockBalances[quoteAsset] || '0';

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Your Spot Balances</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
        <Box textAlign="center">
          <Typography variant="subtitle1">{baseAsset} Balance:</Typography>
          <Typography variant="h5">{baseBalance}</Typography>
        </Box>
        <Box textAlign="center">
          <Typography variant="subtitle1">{quoteAsset} Balance:</Typography>
          <Typography variant="h5">{quoteBalance}</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default SpotBalances;
