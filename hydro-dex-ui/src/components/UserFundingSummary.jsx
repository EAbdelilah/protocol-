import React from 'react';
import useFundingStore from '../store/fundingStore';
import { Paper, Typography, Grid, Box, Tooltip } from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined'; // For Health Factor
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';


const StatBox = ({ title, value, icon, tooltip }) => (
  <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
      {icon}
      <Typography variant="h6" component="div" sx={{ ml: 1 }}>
        {title}
      </Typography>
      {tooltip && (
          <Tooltip title={tooltip}>
            <InfoOutlinedIcon fontSize="inherit" sx={{ ml: 0.5, cursor: 'help', color: 'text.secondary' }} />
          </Tooltip>
        )}
    </Box>
    <Typography variant="h5">{value}</Typography>
  </Paper>
);

const UserFundingSummary = () => {
  const userSummary = useFundingStore((state) => state.userSummary);

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 2 }}>
        Your Funding Summary
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatBox 
            title="Total Supplied" 
            value={`$${userSummary.totalSuppliedUsd}`} 
            icon={<AccountBalanceWalletOutlinedIcon color="success" />}
            tooltip="Total value of assets you have supplied to the protocol, in USD."
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBox 
            title="Total Borrowed" 
            value={`$${userSummary.totalBorrowedUsd}`} 
            icon={<AccountBalanceOutlinedIcon color="error" />}
            tooltip="Total value of assets you have borrowed from the protocol, in USD."
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBox 
            title="Net APY" 
            value={userSummary.netApy} 
            icon={<TrendingUpOutlinedIcon color="primary" />}
            tooltip="Your net annual percentage yield from supplied and borrowed positions. This is a mock value."
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatBox 
            title="Health Factor" 
            value={userSummary.healthFactor} 
            icon={<HealthAndSafetyOutlinedIcon color={userSummary.healthFactor !== 'N/A' && parseFloat(userSummary.healthFactor) < 1.2 ? "error" : "success"}/>}
            tooltip="A representation of the safety of your borrowed position(s). A lower value indicates higher risk of liquidation. This is a mock value."
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UserFundingSummary;
