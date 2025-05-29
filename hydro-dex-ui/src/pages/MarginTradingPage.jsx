import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { Container, Grid, Typography, Box } from '@mui/material';
import MarginTradingForm from '../components/MarginTradingForm';
import MarginPositionsTable from '../components/MarginPositionsTable';
import PriceChart, { generateMockData } from '../components/PriceChart'; // Import PriceChart
import useMarketStore from '../store/marketStore'; // To get selected pair for the chart

const MarginTradingPage = () => {
  const tradingPairs = useMarketStore((state) => state.tradingPairs); // Get all pairs
  // For Margin page, the chart might display the pair selected in the MarginTradingForm.
  // However, MarginTradingForm's selected pair is internal to it.
  // For simplicity, we can use the globally selected pair from marketStore for now,
  // or have a dedicated pair selector for the chart on this page.
  // Let's use the first available pair from marketStore as a default for the chart.
  const [chartPair, setChartPair] = useState(tradingPairs.length > 0 ? tradingPairs[0] : null);
  const [chartData, setChartData] = useState([]);

  // This effect is to handle the case where tradingPairs load after initial render
  useEffect(() => {
    if (!chartPair && tradingPairs.length > 0) {
      setChartPair(tradingPairs[0]);
    }
  }, [tradingPairs, chartPair]);

  useEffect(() => {
    if (chartPair) {
      const pairSymbol = `${chartPair.base}/${chartPair.quote}`;
      setChartData(generateMockData(pairSymbol));
    } else {
      setChartData(generateMockData('WETH/DAI')); // Default data if no pair somehow
    }
    // TODO: A better way would be for MarginTradingForm to emit its selected pair
    // so this page can update the chart accordingly. For now, this is a simplified link.
  }, [chartPair]);


  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}> {/* Changed to xl for more space */}
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 2 }}>
        Margin Trading
      </Typography>

      <Grid container spacing={2}>
         {/* Top Row: Chart - Spanning full width or part of it */}
        <Grid item xs={12} md={7} sx={{ height: '400px', minHeight: '350px', mb:1 }}> 
           <PriceChart 
            data={chartData} 
            pairSymbol={chartPair ? `${chartPair.base}/${chartPair.quote}` : 'Price Chart'}
          />
        </Grid>
        
        {/* Top Right or next to chart: Margin Trading Form */}
        <Grid item xs={12} md={5}>
          <MarginTradingForm /> {/* This form has its own pair selector */}
        </Grid>

        {/* Bottom Row: Margin Positions Table - Spanning full width */}
        <Grid item xs={12}>
          <MarginPositionsTable />
        </Grid>
      </Grid>
    </Container>
  );
};

export default MarginTradingPage;
