import React, { useState, useEffect } from 'react';
import useMarketStore from '../store/marketStore'; // For trading pairs
import useFundingStore, { mockWalletBalances } from '../store/fundingStore'; // For collateral assets & balances
import useMarginStore, { useMarginActions } from '../store/marginStore';
import { mockOpenMarginPosition } from '../services/hydroService';
import { mockAssetPrices } from '../store/fundingStore'; // For price estimates

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
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';

const leverageOptions = [1, 2, 3, 5]; // Mock leverage options

const MarginTradingForm = () => {
  const tradingPairs = useMarketStore((state) => state.tradingPairs);
  const { fundingAssets } = useFundingStore((state) => ({ fundingAssets: state.fundingAssets }));
  const { addMarginPosition } = useMarginActions();

  const [selectedPairId, setSelectedPairId] = useState('');
  const [direction, setDirection] = useState('long');
  const [size, setSize] = useState(''); // Amount of base asset
  const [leverage, setLeverage] = useState(leverageOptions[1]); // Default to 2x
  const [collateralAsset, setCollateralAsset] = useState('');
  const [collateralAmount, setCollateralAmount] = useState('');
  
  const [estimatedTotalSizeUsd, setEstimatedTotalSizeUsd] = useState(0);
  const [estimatedBorrowedAmount, setEstimatedBorrowedAmount] = useState(0);
  const [estimatedLiquidationPrice, setEstimatedLiquidationPrice] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const collateralAssetsList = fundingAssets.filter(a => a.canBeCollateral);

  useEffect(() => {
    if (tradingPairs.length > 0 && !selectedPairId) {
      setSelectedPairId(tradingPairs[0].id);
    }
    if (collateralAssetsList.length > 0 && !collateralAsset) {
      setCollateralAsset(collateralAssetsList[0].asset);
    }
  }, [tradingPairs, collateralAssetsList, selectedPairId, collateralAsset]);

  useEffect(() => {
    // Estimate position details
    const pair = tradingPairs.find(p => p.id === selectedPairId);
    if (!pair || !size || !collateralAsset || !collateralAmount || !leverage) {
      setEstimatedTotalSizeUsd(0);
      setEstimatedBorrowedAmount(0);
      setEstimatedLiquidationPrice(0);
      return;
    }

    const baseAssetPrice = mockAssetPrices[pair.base] || 0; // e.g., WETH price
    const collateralAssetPrice = mockAssetPrices[collateralAsset] || 0; // e.g., DAI price

    const positionSizeInBase = parseFloat(size);
    const collateralValueUsd = parseFloat(collateralAmount) * collateralAssetPrice;
    
    const totalPositionValueUsd = positionSizeInBase * baseAssetPrice;
    setEstimatedTotalSizeUsd(totalPositionValueUsd);

    // Required collateral = totalPositionValueUsd / leverage
    const requiredCollateralUsd = totalPositionValueUsd / leverage;
    
    // This is a simplified calculation.
    // If user inputs collateralAmount, we should ensure it meets `requiredCollateralUsd`.
    // Or, if user inputs size & leverage, we can suggest `collateralAmount`.
    // Let's assume user inputs collateralAmount and we validate.
    // The amount to borrow is the difference not covered by collateral.
    const borrowedUsd = totalPositionValueUsd - collateralValueUsd;
    setEstimatedBorrowedAmount(borrowedUsd > 0 ? borrowedUsd : 0);

    // Mock liquidation price
    const entryPrice = baseAssetPrice; // Assuming current price is entry price for estimation
    let liqPrice = 0;
    if (direction === 'long' && entryPrice > 0) {
      liqPrice = entryPrice * (1 - (1 / leverage) * 0.9); // Simplified: 90% of margin used for liquidation
    } else if (direction === 'short' && entryPrice > 0) {
      liqPrice = entryPrice * (1 + (1 / leverage) * 0.9);
    }
    setEstimatedLiquidationPrice(liqPrice.toFixed(pair.quoteDecimals || 2));

  }, [selectedPairId, size, leverage, collateralAsset, collateralAmount, direction, tradingPairs]);


  const handleSubmit = async () => {
    const pair = tradingPairs.find(p => p.id === selectedPairId);
    if (!pair || !direction || !size || !collateralAsset || !collateralAmount || !leverage) {
      setFeedback('Please fill all fields.');
      return;
    }
    const numericSize = parseFloat(size);
    const numericCollateral = parseFloat(collateralAmount);

    if (numericSize <= 0 || numericCollateral <= 0) {
      setFeedback('Size and Collateral Amount must be greater than zero.');
      return;
    }
    
    const walletBalance = parseFloat(mockWalletBalances[collateralAsset] || '0');
    if (numericCollateral > walletBalance) {
        setFeedback(`Insufficient ${collateralAsset} in wallet. Available: ${walletBalance}`);
        return;
    }

    // Validate if provided collateral is enough for the size and leverage
    const baseAssetPrice = mockAssetPrices[pair.base] || 0;
    const totalPositionValueUsd = numericSize * baseAssetPrice;
    const requiredCollateralUsd = totalPositionValueUsd / leverage;
    const providedCollateralUsd = numericCollateral * (mockAssetPrices[collateralAsset] || 0);

    if (providedCollateralUsd < requiredCollateralUsd * 0.99) { // Allow for tiny precision issues
        setFeedback(`Provided collateral ($${providedCollateralUsd.toFixed(2)}) is less than required ($${requiredCollateralUsd.toFixed(2)}) for ${leverage}x leverage on a $${totalPositionValueUsd.toFixed(2)} position.`);
        return;
    }


    setIsSubmitting(true);
    setFeedback('Opening margin position...');

    const result = await mockOpenMarginPosition(
      pair.id, direction, pair.base, pair.quote, 
      size, collateralAsset, collateralAmount, leverage
    );

    if (result.success && result.positionId) {
      // Add to store
      const newPositionDetails = {
        // id: result.positionId, // store action will create ID
        pair: pair.id,
        baseAsset: pair.base,
        quoteAsset: pair.quote,
        direction,
        entryPrice: parseFloat(result.entryPrice_mock), // from mock service
        size: numericSize,
        collateralAsset,
        collateralAmount: numericCollateral,
        borrowedAsset: direction === 'long' ? pair.quote : pair.base, // Simplified
        borrowedAmount: parseFloat(result.borrowedAmount_mock), // from mock service
        leverage,
        liquidationPrice: parseFloat(result.liquidationPrice_mock), // from mock service
        currentPrice: parseFloat(result.entryPrice_mock), // Initially current price is entry price
      };
      const addedPosition = addMarginPosition(newPositionDetails);
      setFeedback(`Margin position opened successfully! ID: ${addedPosition.id}`);
      // Clear form
      setSize('');
      setCollateralAmount('');
    } else {
      setFeedback(`Error opening position: ${result.message}`);
    }
    setIsSubmitting(false);
  };
  
  const selectedPairDetails = tradingPairs.find(p => p.id === selectedPairId);

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Open Margin Position</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="margin-pair-select-label">Trading Pair</InputLabel>
            <Select
              labelId="margin-pair-select-label"
              value={selectedPairId}
              label="Trading Pair"
              onChange={(e) => setSelectedPairId(e.target.value)}
            >
              {tradingPairs.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.base}/{p.quote}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl component="fieldset" margin="normal">
            <Typography component="legend" variant="body2">Direction</Typography>
            <RadioGroup row value={direction} onChange={(e) => setDirection(e.target.value)}>
              <FormControlLabel value="long" control={<Radio />} label="Long" />
              <FormControlLabel value="short" control={<Radio />} label="Short" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label={`Size (${selectedPairDetails?.base || 'Base'})`}
            type="number"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="leverage-select-label">Leverage</InputLabel>
            <Select
              labelId="leverage-select-label"
              value={leverage}
              label="Leverage"
              onChange={(e) => setLeverage(parseInt(e.target.value,10))}
            >
              {leverageOptions.map((opt) => (
                <MenuItem key={opt} value={opt}>{opt}x</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="collateral-asset-label">Collateral Asset</InputLabel>
            <Select
              labelId="collateral-asset-label"
              value={collateralAsset}
              label="Collateral Asset"
              onChange={(e) => setCollateralAsset(e.target.value)}
            >
              {collateralAssetsList.map((asset) => (
                <MenuItem key={asset.asset} value={asset.asset}>{asset.asset}</MenuItem>
              ))}
            </Select>
             {collateralAsset && <FormHelperText>Wallet: {mockWalletBalances[collateralAsset] || '0'} {collateralAsset}</FormHelperText>}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Collateral Amount"
            type="number"
            value={collateralAmount}
            onChange={(e) => setCollateralAmount(e.target.value)}
            fullWidth
            margin="normal"
            disabled={!collateralAsset}
          />
        </Grid>
        
        <Grid item xs={12}>
            <Paper variant='outlined' sx={{p:1, mt:1}}>
                <Typography variant="body2">Estimates:</Typography>
                <Typography variant="caption" display="block">- Total Position (USD): ~${estimatedTotalSizeUsd.toFixed(2)}</Typography>
                <Typography variant="caption" display="block">- Est. Borrow Amount (USD): ~${estimatedBorrowedAmount.toFixed(2)}</Typography>
                <Typography variant="caption" display="block">- Est. Liq. Price ({selectedPairDetails?.quote || 'Quote'}): ~{estimatedLiquidationPrice}</Typography>
            </Paper>
        </Grid>

        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedPairId || !size || !collateralAsset || !collateralAmount}
            fullWidth
            sx={{ mt: 2 }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Open Margin Position'}
          </Button>
        </Grid>
        {feedback && (
          <Grid item xs={12} sx={{ mt: 1 }}>
            <Typography color={feedback.startsWith('Error') || feedback.startsWith('Insufficient') ? 'error.main' : 'primary.main'}>
              {feedback}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default MarginTradingForm;
