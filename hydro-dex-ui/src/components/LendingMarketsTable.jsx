import React from 'react';
import useFundingStore from '../store/fundingStore';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Tooltip
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';


const LendingMarketsTable = ({ onSupplyClick, onWithdrawClick, onBorrowClick, onRepayClick }) => {
  const fundingAssets = useFundingStore((state) => state.fundingAssets);

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom align="center">
        Lending & Borrowing Markets
      </Typography>
      <TableContainer>
        <Table stickyHeader size="small" aria-label="lending markets table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Asset</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Supply APY</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Borrow APY</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  Collateral Factor
                  <Tooltip title="Percentage of supplied value that can be used as collateral for borrowing.">
                    <InfoOutlinedIcon fontSize="inherit" sx={{ ml: 0.5, cursor: 'help' }} />
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Liquidity</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Your Supply</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Your Borrows</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fundingAssets.map((asset) => (
              <TableRow
                key={asset.asset}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: 'action.hover'} }}
              >
                <TableCell component="th" scope="row">{asset.asset}</TableCell>
                <TableCell align="right" sx={{ color: 'success.dark' }}>{asset.supplyApy}</TableCell>
                <TableCell align="right" sx={{ color: 'error.dark' }}>{asset.borrowApy}</TableCell>
                <TableCell align="right">{asset.canBeCollateral ? asset.collateralFactor : 'N/A'}</TableCell>
                <TableCell align="right">{asset.liquidity}</TableCell>
                <TableCell align="center">
                  {parseFloat(asset.userSupplied) > 0 ? `${asset.userSupplied} (${asset.userSuppliedUsd} USD)` : '-'}
                </TableCell>
                <TableCell align="center">
                  {parseFloat(asset.userBorrowed) > 0 ? `${asset.userBorrowed} (${asset.userBorrowedUsd} USD)` : '-'}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent:'center' }}>
                    <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => onSupplyClick && onSupplyClick(asset.asset)}
                        sx={{p:0.5, minWidth: 'auto'}}
                    >
                      Supply
                    </Button>
                    <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => onWithdrawClick && onWithdrawClick(asset.asset)}
                        disabled={parseFloat(asset.userSupplied) === 0}
                        sx={{p:0.5, minWidth: 'auto'}}
                    >
                      Withdraw
                    </Button>
                    {/* Borrow/Repay buttons can be added here similarly */}
                     <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => onBorrowClick && onBorrowClick(asset.asset)}
                        disabled={!asset.canBeCollateral && parseFloat(asset.userSupplied) === 0} // Example disable logic
                        sx={{p:0.5, minWidth: 'auto'}}
                    >
                      Borrow
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default LendingMarketsTable;
