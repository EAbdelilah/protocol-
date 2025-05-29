import React from 'react';
import { Container, Typography } from '@mui/material';
import TransactionHistoryTable from '../components/TransactionHistoryTable';

const TransactionHistoryPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
        Full Transaction History
      </Typography>
      <TransactionHistoryTable title="All Transactions" /> {/* No limit, no full details link needed here */}
    </Container>
  );
};

export default TransactionHistoryPage;
