import React from 'react';
import useMarketStore, { useMarketActions } from '../store/marketStore';
import { FormControl, InputLabel, Select, MenuItem, Typography, Box } from '@mui/material';

const TradingPairSelector = () => {
  const tradingPairs = useMarketStore((state) => state.tradingPairs);
  const selectedPair = useMarketStore((state) => state.selectedPair);
  const { setSelectedPair } = useMarketActions();

  const handleChange = (event) => {
    setSelectedPair(event.target.value);
  };

  if (!selectedPair) {
    return <Typography>Loading trading pairs...</Typography>;
  }

  return (
    <Box sx={{ minWidth: 200, p: 2, border: '1px solid grey', borderRadius: '4px' }}>
      <Typography variant="h6" gutterBottom>Select Trading Pair</Typography>
      <FormControl fullWidth>
        <InputLabel id="trading-pair-select-label">Pair</InputLabel>
        <Select
          labelId="trading-pair-select-label"
          id="trading-pair-select"
          value={selectedPair.id}
          label="Pair"
          onChange={handleChange}
        >
          {tradingPairs.map((pair) => (
            <MenuItem key={pair.id} value={pair.id}>
              {pair.base}/{pair.quote}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Current Pair: {selectedPair.base}/{selectedPair.quote}
      </Typography>
    </Box>
  );
};

export default TradingPairSelector;
