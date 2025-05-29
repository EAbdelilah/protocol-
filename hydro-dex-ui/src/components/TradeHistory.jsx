import React from 'react';
import useMarketStore from '../store/marketStore';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

// Mock data generator for trade history
const generateMockTrades = (pair) => {
  const trades = [];
  const now = new Date();
  let basePrice;

  if (pair && pair.base === 'WETH' && pair.quote === 'DAI') {
    basePrice = 2000;
  } else if (pair && pair.base === 'HYDRO' && pair.quote === 'WETH') {
    basePrice = 0.0005;
  } else {
    basePrice = 100;
  }

  for (let i = 0; i < 15; i++) {
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const priceFluctuation = (Math.random() - 0.5) * (basePrice * 0.002); // Price fluctuates around basePrice
    const price = (basePrice + priceFluctuation).toFixed(pair ? (pair.quote === 'DAI' ? 2 : 6) : 2);
    const amount = (Math.random() * 10 + 0.1).toFixed(3);
    const time = new Date(now.getTime() - i * 1000 * (Math.random() * 60 + 5)); // Trades in the last few minutes

    trades.push({
      price,
      amount,
      time: time.toLocaleTimeString(),
      side,
    });
  }
  return trades;
};

const TradeHistory = () => {
  const selectedPair = useMarketStore((state) => state.selectedPair);
  // Generate mock trades based on selected pair, or use a default
  const mockTrades = React.useMemo(() => generateMockTrades(selectedPair), [selectedPair]);
  
  const quoteAsset = selectedPair ? selectedPair.quote : 'Quote';
  const baseAsset = selectedPair ? selectedPair.base : 'Base';

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom align="center">
        Trade History {selectedPair ? `(${selectedPair.base}/${selectedPair.quote})` : ''}
      </Typography>
      <TableContainer component={Paper} sx={{ maxHeight: 300, overflowY: 'auto' }}>
        <Table stickyHeader size="small" aria-label="trade history table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Price ({quoteAsset})</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount ({baseAsset})</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockTrades.map((trade, index) => (
              <TableRow
                key={index}
                sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <TableCell component="th" scope="row">
                  {trade.time}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: trade.side === 'buy' ? 'success.main' : 'error.main' }}
                >
                  {trade.price}
                </TableCell>
                <TableCell align="right">{trade.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TradeHistory;
