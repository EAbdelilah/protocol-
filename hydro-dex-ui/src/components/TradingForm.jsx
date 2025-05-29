import React, { useState } from 'react';
import useMarketStore from '../store/marketStore';
import { mockPrepareLimitOrder, signOrder, mockSubmitSignedOrder } from '../services/hydroService';
import { ethers } from 'ethers';
import { useTransactionActions } from '../store/transactionStore'; // Import transaction actions
import {
  TextField,
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress
} from '@mui/material';

// Mock token addresses - replace with actual or fetched addresses later
const mockTokenAddresses = {
    'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Mainnet WETH
    'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',   // Mainnet DAI
    'HYDRO': '0x939c2227Feb3fE3174703735481551755A645478' // Example Hydro address
};


const TradingForm = () => {
  const selectedPair = useMarketStore((state) => state.selectedPair);
  const [orderType, setOrderType] = useState('LIMIT'); // 'LIMIT' or 'MARKET'
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (side) => {
    if (!selectedPair) {
      setFeedback('Please select a trading pair.');
      return;
    }
    if (orderType === 'LIMIT' && !price) {
      setFeedback('Please enter a price for the limit order.');
      return;
    }
    if (!amount) {
      setFeedback('Please enter an amount.');
      return;
    }

    setIsSubmitting(true);
    setFeedback(`Processing ${side} order...`);

    // Assume base and quote decimals from selectedPair (added in marketStore)
    const baseDecimals = selectedPair.baseDecimals || 18;
    const quoteDecimals = selectedPair.quoteDecimals || 18;

    // Convert amount to base units (smallest unit of base token)
    const amountInBaseUnits = ethers.utils.parseUnits(amount, baseDecimals);

    // For limit orders, price is in quote currency per unit of base currency.
    // It needs to be converted to an integer representing the ratio of quoteTokenUnits / baseTokenUnits.
    // E.g. price = 0.001 ETH/HYDRO. If HYDRO has 18 decimals, ETH has 18 decimals.
    // Price for contract = (0.001 * 10^18) * 10^18 / 10^18 = 0.001 * 10^18
    // For simplicity in mock, we'll pass price as a string, and if hydroService needs BigNumber, it will convert.
    // The actual contract might expect price in terms of quoteToken smallest units per baseToken smallest units.
    // For now, mockPrepareLimitOrder can just log it.
    // A more precise conversion for contract interaction:
    // const priceInQuoteUnits = ethers.utils.parseUnits(price, quoteDecimals);
    // const priceForContract = priceInQuoteUnits.mul(ethers.utils.parseUnits("1", baseDecimals)).div(ethers.utils.parseUnits("1", quoteDecimals));
    // This is complex, so for mock, we'll keep it simpler. The service function should handle this.

    const orderDetails = {
      pairId: selectedPair.id,
      baseToken: selectedPair.base,
      quoteToken: selectedPair.quote,
      baseTokenAddress: mockTokenAddresses[selectedPair.base],
      quoteTokenAddress: mockTokenAddresses[selectedPair.quote],
      price: orderType === 'LIMIT' ? price : '0', // Market orders don't have a price in this form
      amount: amountInBaseUnits.toString(), // Pass as string in base units
      originalAmount: amount, // For logging human-readable amount
      side: side, // 'BUY' or 'SELL'
      orderType: orderType,
      // trader: '0xYourTraderAddress' // hydroService will try to get this from signer
    };

    console.log('Submitting order:', orderDetails);

    try {
      const preparedOrder = await mockPrepareLimitOrder(orderDetails);
      console.log('Order prepared (mock):', preparedOrder);

      if (preparedOrder.status === 'error') {
        setFeedback(`Error preparing order: ${preparedOrder.error}`);
        setIsSubmitting(false);
        return;
      }
      
      setFeedback('Order prepared. Please sign the order in your wallet.');

      // Simulate signing (in a real app, this would involve a wallet popup)
      // The actual signOrder function from hydroService should be used if available and working
      // For now, we assume signOrder exists and works similarly to the SDK version.
      // It needs the full order structure as defined in hydroService's generateOrderData
       const orderToSign = {
        trader: preparedOrder.trader, // This should come from the connected wallet
        baseToken: preparedOrder.baseTokenAddress,
        quoteToken: preparedOrder.quoteTokenAddress,
        amount: preparedOrder.amount, // Already in base units
        price: preparedOrder.price, // Already in correct units if service handles it
        side: preparedOrder.side === 'BUY' ? 0 : 1,
        type: 0, // 0 for Limit
        expirationTimeSeconds: Math.floor(Date.now() / 1000) + 3600, // Example
        salt: ethers.BigNumber.from(ethers.utils.randomBytes(32)).toString(), // Example
      };
      
      // This is where actual signing would happen:
      // const signedOrder = await signOrder(orderToSign); // from hydroService
      // console.log('Order signed (actual):', signedOrder);

      // Mocking the signing process for now
      const mockSignedOrder = {
        ...preparedOrder,
        ...orderToSign, // ensure all fields are there for mockSubmit
        signature: '0xmocksignature' + ethers.utils.hexlify(ethers.utils.randomBytes(30)),
        orderHash: preparedOrder.orderHash || ethers.utils.hexlify(ethers.utils.randomBytes(32)), // use from prep if available
        status: 'signed_mock',
      };
      console.log('Order signed (mock):', mockSignedOrder);
      setFeedback('Order signed (mock). Submitting to exchange...');


      const submissionResult = await mockSubmitSignedOrder(mockSignedOrder);
      console.log('Order submission result (mock):', submissionResult);
      setFeedback(`Mock order submitted! TxHash (mock): ${submissionResult.txHash_mock}`);

      // Log to transaction store
      if (submissionResult.status === 'submitted_mock') {
        const { addTransaction } = useTransactionActions.getState(); // Get actions directly
        addTransaction({
          type: 'Spot Trade',
          summary: `${side === 'BUY' ? 'Bought' : 'Sold'} ${orderDetails.originalAmount} ${selectedPair.base} ${side === 'BUY' ? 'for' : 'with'} approx. ${(parseFloat(orderDetails.originalAmount) * parseFloat(orderDetails.price)).toFixed(selectedPair.quoteDecimals || 2)} ${selectedPair.quote}`,
          details: { ...orderDetails, submissionResult }
        });
      }

    } catch (error) {
      console.error('Error during order process:', error);
      setFeedback(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedPair) {
    return <Typography>Select a trading pair to begin.</Typography>;
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>Place Order: {selectedPair.base}/{selectedPair.quote}</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="order-type-label">Order Type</InputLabel>
            <Select
              labelId="order-type-label"
              value={orderType}
              label="Order Type"
              onChange={(e) => setOrderType(e.target.value)}
            >
              <MenuItem value="LIMIT">Limit</MenuItem>
              <MenuItem value="MARKET" disabled>Market (Not Implemented)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          {orderType === 'LIMIT' && (
            <TextField
              label={`Price (${selectedPair.quote})`}
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
            />
          )}
        </Grid>
        <Grid item xs={12}>
          <TextField
            label={`Amount (${selectedPair.base})`}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12}>
          <ButtonGroup fullWidth variant="contained" size="large">
            <Button
              color="success"
              onClick={() => handleSubmit('BUY')}
              disabled={isSubmitting}
            >
              Buy {selectedPair.base}
            </Button>
            <Button
              color="error"
              onClick={() => handleSubmit('SELL')}
              disabled={isSubmitting}
            >
              Sell {selectedPair.base}
            </Button>
          </ButtonGroup>
        </Grid>
        {isSubmitting && (
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <CircularProgress />
          </Grid>
        )}
        {feedback && (
          <Grid item xs={12} sx={{ mt: 1 }}>
            <Typography color={feedback.startsWith('Error') ? 'error' : 'primary'}>
              {feedback}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default TradingForm;
