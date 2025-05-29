import React, { useState } from 'react';
import useMarginStore, { useMarginActions } from '../store/marginStore';
import { mockAddCollateralToMarginPosition, mockCloseMarginPosition } from '../services/hydroService';
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
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
  Chip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import useFundingStore, { mockWalletBalances } from '../store/fundingStore'; // For collateral assets

const AddCollateralDialog = ({ open, onClose, position, onSubmit }) => {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const walletBalance = mockWalletBalances[position?.collateralAsset] || '0';

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (parseFloat(amount) > parseFloat(walletBalance)) {
        alert(`Insufficient ${position.collateralAsset} in wallet. Available: ${walletBalance}`);
        return;
    }
    setIsSubmitting(true);
    await onSubmit(position.id, amount, position.collateralAsset);
    setIsSubmitting(false);
    onClose();
  };

  if (!position) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Collateral to Position {position.id.substring(0,10)}...</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Asset: {position.collateralAsset} (Wallet Balance: {walletBalance})
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label={`Amount of ${position.collateralAsset} to Add`}
          type="number"
          fullWidth
          variant="standard"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={20}/> : "Add Collateral"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


const MarginPositionsTable = () => {
  const marginPositions = useMarginStore((state) => state.marginPositions);
  const { addCollateral, closeMarginPosition, simulatePriceUpdates } = useMarginActions(); // simulate for P&L
  
  const [selectedPositionForCollateral, setSelectedPositionForCollateral] = useState(null);
  const [closingPositionId, setClosingPositionId] = useState(null);

  const handleAddCollateralOpen = (position) => {
    setSelectedPositionForCollateral(position);
  };

  const handleAddCollateralClose = () => {
    setSelectedPositionForCollateral(null);
  };

  const handleAddCollateralSubmit = async (positionId, amount, asset) => {
    console.log(`Submitting add collateral: ${amount} ${asset} to ${positionId}`);
    const serviceResult = await mockAddCollateralToMarginPosition(positionId, amount, asset);
    if (serviceResult.success) {
      addCollateral(positionId, {amount, asset}); // Update store
      alert(serviceResult.message); // Simple feedback
    } else {
      alert(`Error: ${serviceResult.message}`);
    }
  };

  const handleClosePosition = async (positionId) => {
    setClosingPositionId(positionId);
    const confirmClose = window.confirm(`Are you sure you want to close position ${positionId}? This will close 100% of the position.`);
    if (confirmClose) {
      const serviceResult = await mockCloseMarginPosition(positionId, 1); // Close 100%
      if (serviceResult.success) {
        closeMarginPosition(positionId);
        alert(serviceResult.message + ` Mock P&L: ${serviceResult.pnl_mock}`);
      } else {
        alert(`Error: ${serviceResult.message}`);
      }
    }
    setClosingPositionId(null);
  };
  
  // Periodically simulate price updates for P&L demonstration if needed (optional)
    useEffect(() => {
        const intervalId = setInterval(() => {
            simulatePriceUpdates();
        }, 15000); // every 15 seconds
        return () => clearInterval(intervalId);
    }, [simulatePriceUpdates]);


  if (marginPositions.length === 0) {
    return <Typography sx={{mt:2, textAlign:'center'}}>No active margin positions.</Typography>;
  }

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom align="center">
        Active Margin Positions
      </Typography>
      <TableContainer>
        <Table stickyHeader size="small" aria-label="margin positions table">
          <TableHead>
            <TableRow>
              <TableCell>Pair</TableCell>
              <TableCell>Direction</TableCell>
              <TableCell align="right">Size</TableCell>
              <TableCell align="right">Entry Price</TableCell>
              <TableCell align="right">Current Price</TableCell>
              <TableCell align="right">Collateral</TableCell>
              <TableCell align="right">Leverage</TableCell>
              <TableCell align="right">Liq. Price</TableCell>
              <TableCell align="right">P&L</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {marginPositions.map((pos) => (
              <TableRow key={pos.id} sx={{ '&:hover': { backgroundColor: 'action.hover'} }}>
                <TableCell>{pos.pair}</TableCell>
                <TableCell>
                  <Chip 
                    label={pos.direction.toUpperCase()} 
                    color={pos.direction === 'long' ? 'success' : 'error'}
                    size="small" 
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">{pos.size} {pos.baseAsset}</TableCell>
                <TableCell align="right">{pos.entryPrice.toFixed(pos.quoteAsset === 'DAI' ? 2 : 6)}</TableCell>
                <TableCell align="right">{(pos.currentPrice || pos.entryPrice).toFixed(pos.quoteAsset === 'DAI' ? 2 : 6)}</TableCell>
                <TableCell align="right">{pos.collateralAmount} {pos.collateralAsset}</TableCell>
                <TableCell align="right">{pos.leverage}x</TableCell>
                <TableCell align="right">{pos.liquidationPrice.toFixed(pos.quoteAsset === 'DAI' ? 2 : 6)}</TableCell>
                <TableCell align="right" sx={{color: parseFloat(pos.pnl) >= 0 ? 'success.main' : 'error.main'}}>
                    {parseFloat(pos.pnl).toFixed(2)} {pos.quoteAsset}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent:'center' }}>
                    <Tooltip title="Add Collateral">
                      <IconButton size="small" onClick={() => handleAddCollateralOpen(pos)}>
                        <AddCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Close Position">
                      <IconButton 
                        size="small" 
                        onClick={() => handleClosePosition(pos.id)}
                        disabled={closingPositionId === pos.id}
                      >
                        {closingPositionId === pos.id ? <CircularProgress size={16}/> : <CancelOutlinedIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {selectedPositionForCollateral && (
        <AddCollateralDialog
          open={Boolean(selectedPositionForCollateral)}
          onClose={handleAddCollateralClose}
          position={selectedPositionForCollateral}
          onSubmit={handleAddCollateralSubmit}
        />
      )}
    </Paper>
  );
};

export default MarginPositionsTable;
