import React from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { Container, Grid, Typography, Box } from '@mui/material';
import TradingPairSelector from '../components/TradingPairSelector';
import SpotBalances from '../components/SpotBalances';
import TradingForm from '../components/TradingForm';
import OrderBook from '../components/OrderBook';
import TradeHistory from '../components/TradeHistory';
import PriceChart, { generateMockData } from '../components/PriceChart'; // Import PriceChart and mock data generator
import useMarketStore from '../store/marketStore'; // To get selected pair

const SpotTradingPage = () => {
  const selectedPair = useMarketStore((state) => state.selectedPair);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (selectedPair) {
      // Generate new mock data when the selected pair changes
      const pairSymbol = `${selectedPair.base}/${selectedPair.quote}`;
      setChartData(generateMockData(pairSymbol));
    }
  }, [selectedPair]); // Dependency array includes selectedPair

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 2 }}>
        Spot Trading
      </Typography>
      <Grid container spacing={2}>
        {/* Top Row: Chart */}
        <Grid item xs={12} sx={{ height: '400px', minHeight: '350px', mb: 1 }}> {/* Ensure chart has enough space */}
          <PriceChart 
            data={chartData} 
            pairSymbol={selectedPair ? `${selectedPair.base}/${selectedPair.quote}` : 'Price Chart'} 
          />
        </Grid>

        {/* Bottom Section with 3 columns */}
        {/* Column 1: Trading Pair Selector and Balances */}
        <Grid item xs={12} lg={3}> 
          <Box>
            <TradingPairSelector />
            <SpotBalances />
          </Box>
        </Grid>

        {/* Column 2: Trading Form */}
        <Grid item xs={12} lg={5}> 
          <TradingForm />
        </Grid>

        {/* Column 3: Order Book and Trade History */}
        <Grid item xs={12} lg={4}> 
          <OrderBook />
          <TradeHistory sx={{ mt: 2 }}/>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SpotTradingPage;
