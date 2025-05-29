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
  TableRow,
  Grid,
  Box
} from '@mui/material';

// Mock data generator for order book
const generateMockOrders = (pair) => {
  const orders = { bids: [], asks: [] };
  let basePrice;

  // Adjust mock price range based on pair for some variation
  if (pair && pair.base === 'WETH' && pair.quote === 'DAI') {
    basePrice = 2000;
  } else if (pair && pair.base === 'HYDRO' && pair.quote === 'WETH') {
    basePrice = 0.0005;
  } else {
    basePrice = 100; // Default
  }

  for (let i = 0; i < 10; i++) {
    orders.bids.push({
      price: (basePrice - i * (basePrice * 0.001) - Math.random() * (basePrice * 0.0005)).toFixed(pair ? (pair.quote === 'DAI' ? 2 : 6) : 2),
      amount: (Math.random() * 20 + 1).toFixed(3),
      total: ((basePrice - i * 0.1) * (Math.random() * 20 + 1)).toFixed(2) // Mock total
    });
    orders.asks.push({
      price: (basePrice + i * (basePrice * 0.001) + Math.random() * (basePrice * 0.0005)).toFixed(pair ? (pair.quote === 'DAI' ? 2 : 6) : 2),
      amount: (Math.random() * 20 + 1).toFixed(3),
      total: ((basePrice + i * 0.1) * (Math.random() * 20 + 1)).toFixed(2) // Mock total
    });
  }
  // Sort bids descending, asks ascending by price
  orders.bids.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  orders.asks.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  return orders;
};

const OrderBookTable = ({ orders, type, pair }) => {
  const quoteAsset = pair ? pair.quote : 'Quote';
  const baseAsset = pair ? pair.base : 'Base';

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 300, overflowY: 'auto' }}>
      <Table stickyHeader size="small" aria-label={`${type} orders table`}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: type === 'bids' ? 'green' : 'red', fontWeight: 'bold' }}>
              Price ({quoteAsset})
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Amount ({baseAsset})</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total ({quoteAsset})</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order, index) => (
            <TableRow
              key={index}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                '&:hover': { backgroundColor: type === 'bids' ? 'rgba(0,255,0,0.05)' : 'rgba(255,0,0,0.05)'}
              }}
            >
              <TableCell component="th" scope="row" sx={{ color: type === 'bids' ? 'green' : 'red' }}>
                {order.price}
              </TableCell>
              <TableCell align="right">{order.amount}</TableCell>
              <TableCell align="right">{order.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const OrderBook = () => {
  const selectedPair = useMarketStore((state) => state.selectedPair);
  // Generate mock orders based on selected pair, or use a default if no pair is selected
  const mockOrders = React.useMemo(() => generateMockOrders(selectedPair), [selectedPair]);

  return (
    <Paper elevation={2} sx={{ p: 2, mt:2 }}>
      <Typography variant="h6" gutterBottom align="center">
        Order Book {selectedPair ? `(${selectedPair.base}/${selectedPair.quote})` : ''}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" align="center" sx={{ color: 'red', fontWeight: 'medium' }}>Asks</Typography>
          <OrderBookTable orders={mockOrders.asks} type="asks" pair={selectedPair} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" align="center" sx={{ color: 'green', fontWeight: 'medium' }}>Bids</Typography>
          <OrderBookTable orders={mockOrders.bids} type="bids" pair={selectedPair} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default OrderBook;
