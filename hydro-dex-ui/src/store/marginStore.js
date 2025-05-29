import { create } from 'zustand';
import { mockAssetPrices } from './fundingStore'; // Assuming mockAssetPrices can be reused

const initialMarginPositions = [
  // Example initial position
  // {
  //   id: 'pos_12345',
  //   pair: 'WETH/DAI',
  //   baseAsset: 'WETH',
  //   quoteAsset: 'DAI',
  //   direction: 'long',
  //   entryPrice: 2000, // Price of WETH in DAI
  //   size: 1, // 1 WETH
  //   collateralAsset: 'DAI',
  //   collateralAmount: 1000, // 1000 DAI collateral
  //   borrowedAsset: 'DAI', // Borrowed DAI to buy WETH
  //   borrowedAmount: 1000, // Borrowed 1000 DAI
  //   leverage: 2, // (1000 collateral + 1000 borrowed) / 1000 collateral
  //   liquidationPrice: 1550, // Mock
  //   currentPrice: 2050, // Mock current price of WETH in DAI
  //   pnl: 50, // Mock P&L in quote asset (DAI)
  // },
];

let positionIdCounter = 0;

const useMarginStore = create((set, get) => ({
  marginPositions: initialMarginPositions,
  actions: {
    addMarginPosition: (positionDetails) => {
      positionIdCounter += 1;
      const newPosition = {
        id: `pos_${Date.now()}_${positionIdCounter}`,
        ...positionDetails,
        // Calculate P&L based on current price if provided, else default to 0
        pnl: ((positionDetails.currentPrice || positionDetails.entryPrice) - positionDetails.entryPrice) * positionDetails.size * (positionDetails.direction === 'long' ? 1 : -1),
      };
      set((state) => ({
        marginPositions: [...state.marginPositions, newPosition],
      }));
      return newPosition;
    },
    updateMarginPosition: (positionId, updates) => {
      set((state) => ({
        marginPositions: state.marginPositions.map((pos) => {
          if (pos.id === positionId) {
            const updatedPos = { ...pos, ...updates };
            // Recalculate P&L if currentPrice is updated
            if (updates.currentPrice !== undefined) {
              updatedPos.pnl = ((updatedPos.currentPrice || updatedPos.entryPrice) - updatedPos.entryPrice) * updatedPos.size * (updatedPos.direction === 'long' ? 1 : -1);
            }
            return updatedPos;
          }
          return pos;
        }),
      }));
    },
    addCollateral: (positionId, additionalCollateral) => {
        // This is a simplified mock. Real collateral addition would affect leverage, liq price etc.
        set((state) => ({
            marginPositions: state.marginPositions.map((pos) => {
                if (pos.id === positionId) {
                    const newCollateralAmount = (parseFloat(pos.collateralAmount) + parseFloat(additionalCollateral.amount)).toString();
                    // Leverage would change, liq price would change. Mocking this simply for now.
                    // newLeverage = (pos.size * pos.entryPrice) / newCollateralAmount
                    return { ...pos, collateralAmount: newCollateralAmount, notes: (pos.notes || '') + `Added ${additionalCollateral.amount} ${additionalCollateral.asset} collateral. `};
                }
                return pos;
            })
        }));
    },
    closeMarginPosition: (positionId, portionToClose = 1) => { // portionToClose = 1 (100%)
      set((state) => ({
        marginPositions: state.marginPositions.filter((pos) => pos.id !== positionId),
        // In a real app, you might move it to a "closed positions" list or log P&L
      }));
    },
    // Example: Simulate price updates for P&L changes
    simulatePriceUpdates: () => {
        set(state => ({
            marginPositions: state.marginPositions.map(pos => {
                const priceChange = (Math.random() - 0.5) * (pos.entryPrice * 0.02); // up to 2% change
                const newCurrentPrice = parseFloat((pos.entryPrice + priceChange).toFixed(pos.quoteAsset === 'DAI' ? 2 : 6));
                const newPnl = (newCurrentPrice - pos.entryPrice) * pos.size * (pos.direction === 'long' ? 1 : -1);
                return { ...pos, currentPrice: newCurrentPrice, pnl: newPnl.toFixed(2) };
            })
        }))
    }
  },
}));

export const useMarginActions = () => useMarginStore((state) => state.actions);

export default useMarginStore;

// Import transaction store actions
import { useTransactionActions as getTransactionActions } from './transactionStore';

// Modify actions in marginStore to log transactions
const originalMarginActions = useMarginStore.getState().actions;

useMarginStore.setState(state => ({
  actions: {
    ...state.actions,
    addMarginPosition: (positionDetails) => {
      // The original addMarginPosition in the store already returns the newPosition
      const newPosition = originalMarginActions.addMarginPosition(positionDetails);
      if (newPosition) {
        getTransactionActions().addTransaction({
          type: 'Margin Open',
          summary: `Opened ${newPosition.direction.toUpperCase()} ${newPosition.size} ${newPosition.pair} @ ${newPosition.entryPrice.toFixed(2)} (${newPosition.leverage}x Lev)`,
          details: { ...newPosition }
        });
      }
      return newPosition; // Ensure it still returns the position for the form
    },
    addCollateral: (positionId, additionalCollateral) => {
      originalMarginActions.addCollateral(positionId, additionalCollateral);
      // Fetch the updated position to include in transaction details (optional, or just log amounts)
      const updatedPosition = get().marginPositions.find(p => p.id === positionId);
      getTransactionActions().addTransaction({
        type: 'Margin Add Collateral',
        summary: `Added ${additionalCollateral.amount} ${additionalCollateral.asset} collateral to position ${positionId.substring(0,10)}...`,
        details: { positionId, addedCollateral: additionalCollateral, updatedPosition }
      });
    },
    closeMarginPosition: (positionId, portionToClose = 1) => {
      // We need P&L for the summary, but P&L is often calculated on close by the backend/service.
      // The mock service `mockCloseMarginPosition` returns a `pnl_mock`.
      // For this example, we'll assume the P&L is known or passed somehow.
      // If the store's close action itself calculated P&L, we'd use that.
      // Let's assume P&L is passed or can be fetched before removing from store.
      const positionToClose = get().marginPositions.find(p => p.id === positionId);
      if (!positionToClose) return; // Should not happen if called from UI correctly

      // For the summary, we might need the P&L which isn't directly available here after original action.
      // The mock service returns a pnl_mock. We'll use that for the transaction summary.
      // This is a bit of a workaround as the store's close action just filters.
      // A "real" system might have the close action update the position with closedPnl before filtering.
      
      originalMarginActions.closeMarginPosition(positionId, portionToClose);
      
      // Since mockCloseMarginPosition in service has pnl_mock, we'd ideally get it from there.
      // For now, let's use the position's current P&L as a placeholder.
      // This is not ideal as the P&L might not be the final "realized" P&L from the close operation.
      const pnlAtClose = positionToClose.pnl || 0; // Use current P&L as placeholder

      getTransactionActions().addTransaction({
        type: 'Margin Close',
        summary: `Closed ${positionToClose.direction.toUpperCase()} ${positionToClose.size} ${positionToClose.pair}. P&L: ${parseFloat(pnlAtClose).toFixed(2)} ${positionToClose.quoteAsset}`,
        details: { ...positionToClose, closedPortion: portionToClose, realizedPnl: pnlAtClose }
      });
    }
  }
}));


// Periodically simulate price updates for P&L demonstration if needed (optional)
// setInterval(() => {
//   useMarginStore.getState().actions.simulatePriceUpdates();
// }, 15000); // every 15 seconds
