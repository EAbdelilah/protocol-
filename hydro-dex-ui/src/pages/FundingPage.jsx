import React, { useState } from 'react';
import { Container, Grid, Typography, Box, Paper, Tabs, Tab } from '@mui/material';
import UserFundingSummary from '../components/UserFundingSummary';
import LendingMarketsTable from '../components/LendingMarketsTable';
import SupplyAssetForm from '../components/SupplyAssetForm';
import WithdrawAssetForm from '../components/WithdrawAssetForm';
import BorrowAssetForm from '../components/BorrowAssetForm'; 
import RepayAssetForm from '../components/RepayAssetForm';
import TransactionHistoryTable from '../components/TransactionHistoryTable'; // Import for snippet

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`funding-tabpanel-${index}`}
      aria-labelledby={`funding-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const FundingPage = () => {
  const [selectedAsset, setSelectedAsset] = useState(null); // To pre-fill forms from table
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedAsset(null); // Clear any pre-selected asset when changing main tabs
  };

  // These handlers would be passed to LendingMarketsTable
  // For now, they just set the selected asset for the forms, and could switch tabs
  const handleSupplyClick = (assetTicker) => {
    setSelectedAsset(assetTicker); // This could be used to pre-fill SupplyAssetForm
    setActiveTab(0); // Switch to Supply tab
    // Scroll to form or focus logic could be added here
    const supplyFormElement = document.getElementById('supply-form-section');
    if (supplyFormElement) supplyFormElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWithdrawClick = (assetTicker) => {
    setSelectedAsset(assetTicker); // Pre-fill WithdrawAssetForm
    setActiveTab(1); // Switch to Withdraw tab
    const withdrawFormElement = document.getElementById('withdraw-form-section');
    if (withdrawFormElement) withdrawFormElement.scrollIntoView({ behavior: 'smooth' });
  };
  
    // Placeholder for borrow/repay click handlers
  const handleBorrowClick = (assetTicker) => {
    console.log("Borrow button clicked for:", assetTicker);
    setSelectedAsset(assetTicker);
    setActiveTab(2); // Assuming tab 2 is Borrow
    const borrowFormElement = document.getElementById('borrow-form-section');
    if (borrowFormElement) borrowFormElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRepayClick = (assetTicker) => {
    console.log("Repay button clicked for:", assetTicker);
    setSelectedAsset(assetTicker);
    setActiveTab(3); // Assuming tab 3 is Repay
    const repayFormElement = document.getElementById('repay-form-section');
    if (repayFormElement) repayFormElement.scrollIntoView({ behavior: 'smooth' });
  };


  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
        Lending & Borrowing Dashboard
      </Typography>

      <UserFundingSummary />

      <LendingMarketsTable 
        onSupplyClick={handleSupplyClick}
        onWithdrawClick={handleWithdrawClick}
        onBorrowClick={handleBorrowClick}
        onRepayClick={handleRepayClick} // Added repay click handler
      />

      <Paper elevation={3} sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="funding actions tabs" centered>
            <Tab label="Supply" id="funding-tab-0" aria-controls="funding-tabpanel-0" />
            <Tab label="Withdraw" id="funding-tab-1" aria-controls="funding-tabpanel-1" />
            <Tab label="Borrow" id="funding-tab-2" aria-controls="funding-tabpanel-2" />
            <Tab label="Repay" id="funding-tab-3" aria-controls="funding-tabpanel-3" />
          </Tabs>
        </Box>
        <TabPanel value={activeTab} index={0}>
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={10} md={8} lg={6} id="supply-form-section">
              <SupplyAssetForm assetToSupply={selectedAsset} /> {/* Pass preselected asset */}
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={10} md={8} lg={6} id="withdraw-form-section">
              <WithdrawAssetForm assetToWithdraw={selectedAsset} /> {/* Pass preselected asset */}
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={10} md={8} lg={6} id="borrow-form-section">
              <BorrowAssetForm assetToBorrow={selectedAsset} /> {/* Pass preselected asset */}
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={10} md={8} lg={6} id="repay-form-section">
              <RepayAssetForm assetToRepay={selectedAsset} /> {/* Pass preselected asset */}
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Recent Transactions Snippet */}
      <Box sx={{ mt: 4 }}>
        <TransactionHistoryTable limit={5} showFullDetailsLink={true} title="Recent Funding Activity"/>
      </Box>
    </Container>
  );
};

export default FundingPage;
