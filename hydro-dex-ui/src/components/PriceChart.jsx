import React, { useEffect, useRef, memo } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { Paper, Typography, useTheme } from '@mui/material';

// Helper function to generate some mock OHLCV data
export const generateMockData = (pairSymbol, numPoints = 100) => {
  const data = [];
  let date = new Date();
  date.setDate(date.getDate() - numPoints); // Start numPoints days ago
  let price = Math.random() * 100 + 50; // Initial random price

  // Adjust price scale based on pair for more realistic mock
  if (pairSymbol === 'WETH/DAI' || pairSymbol === 'WETH-DAI') price = Math.random() * 500 + 1800;
  if (pairSymbol === 'HYDRO/WETH' || pairSymbol === 'HYDRO-WETH') price = Math.random() * 0.0005 + 0.0001;


  for (let i = 0; i < numPoints; i++) {
    date.setDate(date.getDate() + 1);
    const open = price;
    const high = open + Math.random() * (price * 0.03); // Price can fluctuate up to 3% for high
    const low = open - Math.random() * (price * 0.03);  // And 3% for low
    const close = (high + low) / 2 + (Math.random() - 0.5) * (price * 0.015); // Close somewhere in between, with slight variance
    const volume = Math.random() * 1000 + 200;

    data.push({
      time: date.toISOString().split('T')[0], // Use YYYY-MM-DD for candlestick time
      open: parseFloat(open.toFixed(5)),
      high: parseFloat(high.toFixed(5)),
      low: parseFloat(low.toFixed(5)),
      close: parseFloat(close.toFixed(5)),
      value: parseFloat(volume.toFixed(2)) // Using 'value' for volume as per some conventions
    });
    price = close + (Math.random() - 0.5) * (price * 0.02); // Next day's open based on previous close
     if (price <= 0) price = Math.random()*0.01; // Ensure price doesn't go to zero or negative
  }
  return data;
};


const PriceChart = ({ data, chartType = 'candlestick', pairSymbol = 'Trading Pair' }) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const theme = useTheme(); // Access Material-UI theme

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return;

    // Clean up previous chart instance if it exists
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }
    
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 300, // Default height if not set by container
      layout: {
        background: { type: ColorType.Solid, color: theme.palette.background.paper },
        textColor: theme.palette.text.secondary,
      },
      grid: {
        vertLines: { color: theme.palette.divider },
        horzLines: { color: theme.palette.divider },
      },
      timeScale: {
        borderColor: theme.palette.divider,
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: theme.palette.divider,
      },
    });
    chartRef.current = chart;

    if (chartType === 'candlestick') {
      seriesRef.current = chart.addCandlestickSeries({
        upColor: theme.palette.success.main,
        downColor: theme.palette.error.main,
        borderDownColor: theme.palette.error.dark,
        borderUpColor: theme.palette.success.dark,
        wickDownColor: theme.palette.error.dark,
        wickUpColor: theme.palette.success.dark,
      });
    } else { // line chart
      seriesRef.current = chart.addLineSeries({
        color: theme.palette.primary.main,
        lineWidth: 2,
      });
      // For line chart, data needs to be { time, value }
      // Assuming 'close' price for line chart value if OHLC data is passed
      const lineData = data.map(item => ({ time: item.time, value: item.close }));
      seriesRef.current.setData(lineData);
      return; // Early return for line series
    }

    seriesRef.current.setData(data);
    chart.timeScale().fitContent();


    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.resize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight || 300);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [data, chartType, theme]); // Re-run effect if data, type or theme changes

  // Update data without full re-render if only data changes
  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
        if (chartType === 'candlestick') {
            seriesRef.current.setData(data);
        } else {
            const lineData = data.map(item => ({ time: item.time, value: item.close }));
            seriesRef.current.setData(lineData);
        }
        if (chartRef.current) {
             // chartRef.current.timeScale().fitContent(); // Optional: auto-fit on data change
        }
    }
  }, [data, chartType]);


  return (
    <Paper elevation={2} sx={{ height: '100%', minHeight: '300px', p: 1, display: 'flex', flexDirection: 'column' }}>
       <Typography variant="subtitle1" gutterBottom sx={{ textAlign: 'center', py:0.5 }}>
        {pairSymbol} Price Chart
      </Typography>
      <div ref={chartContainerRef} style={{ flexGrow: 1, width: '100%', height: '100%' }} />
    </Paper>
  );
};

// Memoize the component to prevent re-renders if props haven't changed
export default memo(PriceChart);
