import React from 'react';
import useTransactionStore from '../store/transactionStore';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Link as MuiLink, // For the optional "View All" link
  Tooltip
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'; // If using React Router for navigation
import { format } from 'date-fns'; // For formatting timestamp

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'Pending': return 'warning';
    case 'Failed': return 'error';
    default: return 'default';
  }
};

const TransactionHistoryTable = ({ limit, showFullDetailsLink = false, title = "Transaction History" }) => {
  const transactions = useTransactionStore((state) => state.transactions);

  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  if (displayTransactions.length === 0 && !showFullDetailsLink) { // Don't show "No transactions" if it's a snippet with a link
    return (
      <Paper elevation={1} sx={{ p: 2, mt: 2, textAlign: 'center' }}>
        <Typography variant="subtitle1">{title}</Typography>
        <Typography variant="body2" sx={{mt:1}}>No transactions yet.</Typography>
      </Paper>
    );
  }
  
  return (
    <Paper elevation={1} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom align="center">
        {title}
      </Typography>
      <TableContainer sx={{ maxHeight: limit ? 300 : 'none' /* Allow scroll for limited view */ }}>
        <Table stickyHeader size="small" aria-label="transaction history table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Summary</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayTransactions.map((tx) => (
              <TableRow
                key={tx.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'action.hover' } }}
              >
                <TableCell component="th" scope="row">
                  <Tooltip title={tx.timestamp}>
                    <span>{format(new Date(tx.timestamp), 'PP pp')}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>{tx.type}</TableCell>
                <TableCell>
                  <Tooltip title={tx.details ? JSON.stringify(tx.details, null, 2) : 'No details'}>
                    <span>{tx.summary}</span>
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Chip label={tx.status} color={getStatusColor(tx.status)} size="small" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {showFullDetailsLink && (
        <Box sx={{ textAlign: 'right', mt: 1 }}>
          <MuiLink component={RouterLink} to="/history">
            View All Transactions
          </MuiLink>
        </Box>
      )}
       {displayTransactions.length === 0 && showFullDetailsLink && (
         <Typography variant="body2" sx={{mt:1, textAlign:'center'}}>No recent transactions.</Typography>
       )}
    </Paper>
  );
};

export default TransactionHistoryTable;
