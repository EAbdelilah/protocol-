import { create } from 'zustand';

// Mock wallet balances for assets - could be in a general user store later
export const mockWalletBalances = {
  'DAI': '1000', // User has 1000 DAI in their wallet
  'WETH': '5',    // User has 5 WETH in their wallet
  'USDC': '2500',
  'HYDRO': '50000',
};

const initialFundingAssets = [
  { 
    asset: 'DAI', 
    supplyApy: '5.12%', 
    borrowApy: '7.34%', 
    userSupplied: '0', 
    userSuppliedUsd: '0',
    userBorrowed: '0', 
    userBorrowedUsd: '0',
    collateralFactor: '75%',
    liquidity: '1,500,000 DAI',
    canBeCollateral: true,
  },
  { 
    asset: 'WETH', 
    supplyApy: '3.05%', 
    borrowApy: '4.22%', 
    userSupplied: '0', 
    userSuppliedUsd: '0',
    userBorrowed: '0', 
    userBorrowedUsd: '0',
    collateralFactor: '80%',
    liquidity: '2,000 WETH',
    canBeCollateral: true,
  },
  { 
    asset: 'USDC', 
    supplyApy: '4.88%', 
    borrowApy: '6.95%', 
    userSupplied: '0', 
    userSuppliedUsd: '0',
    userBorrowed: '0', 
    userBorrowedUsd: '0',
    collateralFactor: '75%',
    liquidity: '1,200,000 USDC',
    canBeCollateral: true,
  },
   { 
    asset: 'HYDRO', 
    supplyApy: '2.50%', 
    borrowApy: '3.75%', 
    userSupplied: '0', 
    userSuppliedUsd: '0',
    userBorrowed: '0', 
    userBorrowedUsd: '0',
    collateralFactor: '60%', // Example
    liquidity: '10,000,000 HYDRO',
    canBeCollateral: false, // Example: HYDRO might not be usable as collateral initially
  },
];

// Mock prices for USD calculation
const mockAssetPrices = {
    'DAI': 1,
    'WETH': 2000, // Assuming WETH is $2000
    'USDC': 1,
    'HYDRO': 0.05, // Assuming HYDRO is $0.05
};

const useFundingStore = create((set, get) => ({
  fundingAssets: initialFundingAssets,
  userSummary: {
    totalSuppliedUsd: 0,
    totalBorrowedUsd: 0,
    netApy: '0.00%', // This would be a complex calculation
    healthFactor: 'N/A', // Placeholder for health factor
  },
  actions: {
    // Action to simulate supplying an asset
    supplyAsset: (assetTicker, amount) => {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) return false;

      set((state) => {
        const newAssets = state.fundingAssets.map(a => {
          if (a.asset === assetTicker) {
            const newSupplied = parseFloat(a.userSupplied) + numericAmount;
            const newSuppliedUsd = newSupplied * (mockAssetPrices[assetTicker] || 0);
            return { ...a, userSupplied: newSupplied.toString(), userSuppliedUsd: newSuppliedUsd.toString() };
          }
          return a;
        });
        const newSummary = get().actions.calculateUserSummary(newAssets);
        return { fundingAssets: newAssets, userSummary: newSummary };
      });
      // Simulate deducting from mock wallet balance
      mockWalletBalances[assetTicker] = (parseFloat(mockWalletBalances[assetTicker] || 0) - numericAmount).toString();
      return true;
    },
    // Action to simulate withdrawing an asset
    withdrawAsset: (assetTicker, amount) => {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) return false;

      let success = false;
      set((state) => {
        const newAssets = state.fundingAssets.map(a => {
          if (a.asset === assetTicker) {
            const currentSupplied = parseFloat(a.userSupplied);
            if (numericAmount <= currentSupplied) {
              const newSupplied = currentSupplied - numericAmount;
              const newSuppliedUsd = newSupplied * (mockAssetPrices[assetTicker] || 0);
              success = true;
              // Simulate adding to mock wallet balance
              mockWalletBalances[assetTicker] = (parseFloat(mockWalletBalances[assetTicker] || 0) + numericAmount).toString();
              return { ...a, userSupplied: newSupplied.toString(), userSuppliedUsd: newSuppliedUsd.toString() };
            }
          }
          return a;
        });
        if (success) {
            const newSummary = get().actions.calculateUserSummary(newAssets);
            return { fundingAssets: newAssets, userSummary: newSummary };
        }
        return {}; // No change if withdrawal failed
      });
      return success;
    },
    borrowAsset: (assetTicker, amount) => {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) return false;

      set((state) => {
        const newAssets = state.fundingAssets.map(a => {
          if (a.asset === assetTicker) {
            // Basic check: can we even borrow this asset (e.g. does it have liquidity, is user allowed by collateral)
            // For this mock, we'll assume checks passed if service layer said so.
            const newBorrowed = parseFloat(a.userBorrowed) + numericAmount;
            const newBorrowedUsd = newBorrowed * (mockAssetPrices[assetTicker] || 0);
            // Add borrowed amount to wallet balance
            mockWalletBalances[assetTicker] = (parseFloat(mockWalletBalances[assetTicker] || '0') + numericAmount).toString();
            return { ...a, userBorrowed: newBorrowed.toString(), userBorrowedUsd: newBorrowedUsd.toString() };
          }
          return a;
        });
        const newSummary = get().actions.calculateUserSummary(newAssets);
        return { fundingAssets: newAssets, userSummary: newSummary };
      });
      return true;
    },
    repayAsset: (assetTicker, amount) => {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) return false;

      let success = false;
      set((state) => {
        const currentWalletBalance = parseFloat(mockWalletBalances[assetTicker] || '0');
        if (numericAmount > currentWalletBalance) {
          console.warn(`[Store] Repay failed: Insufficient wallet balance for ${assetTicker}. Need ${numericAmount}, have ${currentWalletBalance}`);
          return {}; // Not enough in wallet
        }

        const newAssets = state.fundingAssets.map(a => {
          if (a.asset === assetTicker) {
            const currentBorrowed = parseFloat(a.userBorrowed);
            if (numericAmount <= currentBorrowed) {
              const newBorrowed = currentBorrowed - numericAmount;
              const newBorrowedUsd = newBorrowed * (mockAssetPrices[assetTicker] || 0);
              // Deduct repaid amount from wallet balance
              mockWalletBalances[assetTicker] = (currentWalletBalance - numericAmount).toString();
              success = true;
              return { ...a, userBorrowed: newBorrowed.toString(), userBorrowedUsd: newBorrowedUsd.toString() };
            } else {
                 console.warn(`[Store] Repay failed: Repay amount ${numericAmount} exceeds current borrowed ${currentBorrowed} for ${assetTicker}`);
            }
          }
          return a;
        });
        
        if (success) {
            const newSummary = get().actions.calculateUserSummary(newAssets);
            return { fundingAssets: newAssets, userSummary: newSummary };
        }
        return {}; // No change if repay conditions not met
      });
      return success;
    },
    // Helper to recalculate user summary
    calculateUserSummary: (assets) => {
      const totalSuppliedUsd = assets.reduce((sum, a) => sum + parseFloat(a.userSuppliedUsd || '0'), 0);
      const totalBorrowedUsd = assets.reduce((sum, a) => sum + parseFloat(a.userBorrowedUsd || '0'), 0);
      // Net APY calculation is complex and depends on individual APYs, amounts, and potentially interest rates.
      // For mock purposes, we'll keep it simple or use a placeholder.
      // A weighted average could be:
      // const totalWeightedSupplyApy = assets.reduce((sum,a) => sum + (parseFloat(a.userSuppliedUsd || '0') * parseFloat(a.supplyApy) / 100), 0)
      // const netApy = totalSuppliedUsd > 0 ? (totalWeightedSupplyApy / totalSuppliedUsd * 100) : 0;
      // This doesn't account for borrows. True Net APY is more involved.
      
      // Calculate total collateral value (sum of userSuppliedUsd for assets that canBeCollateral)
      const totalCollateralUsd = assets.reduce((sum, a) => {
        if (a.canBeCollateral) {
          return sum + parseFloat(a.userSuppliedUsd || '0');
        }
        return sum;
      }, 0);
      
      // Calculate weighted borrow limit
      // This is a simplified version. Real borrow limit depends on collateral factors of specific supplied assets.
      // For a more accurate mock, you'd sum (userSuppliedUsd * collateralFactor) for each collateral asset.
      // Here, we'll use an average collateral factor or a simplified approach.
      // Let's assume an average collateral factor for simplicity in mock or use a more detailed calculation if needed.
      // For now, the health factor is mocked more directly.
      
      let healthFactorDisplay = 'N/A';
      if (totalBorrowedUsd > 0) {
          if (totalCollateralUsd > 0) {
              // A simplified health factor: (Total Collateral * Avg. Collateral Factor) / Total Borrowed
              // For this mock, let's assume an average CF of 0.75 for calculation if we don't iterate
              // A better mock: sum of (suppliedValue * CF) for each asset / totalBorrowed
              let weightedCollateralSum = 0;
              assets.forEach(asset => {
                  if(asset.canBeCollateral && parseFloat(asset.userSuppliedUsd) > 0){
                      weightedCollateralSum += parseFloat(asset.userSuppliedUsd) * (parseFloat(asset.collateralFactor) / 100);
                  }
              });
              healthFactorDisplay = (weightedCollateralSum / totalBorrowedUsd).toFixed(2);
          } else {
              healthFactorDisplay = '0.00'; // Borrowing without collateral
          }
      }


      return {
        totalSuppliedUsd: totalSuppliedUsd.toFixed(2),
        totalBorrowedUsd: totalBorrowedUsd.toFixed(2),
        netApy: `${(Math.random() * 5).toFixed(2)}%`, // Mock Net APY for now
        healthFactor: healthFactorDisplay, 
      };
    }
  }
}));

export const useFundingActions = () => useFundingStore((state) => state.actions);

// Initialize summary
const initialAssets = useFundingStore.getState().fundingAssets;
const initialSummary = useFundingStore.getState().actions.calculateUserSummary(initialAssets);
useFundingStore.setState({ userSummary: initialSummary });

// Import transaction store actions
import { useTransactionActions as getTransactionActions } from './transactionStore'; // Renamed to avoid conflict

// Modify actions in fundingStore to log transactions
const originalFundingActions = useFundingStore.getState().actions;

useFundingStore.setState(state => ({
  actions: {
    ...state.actions,
    supplyAsset: (assetTicker, amount) => {
      const result = originalFundingActions.supplyAsset(assetTicker, amount);
      if (result) {
        getTransactionActions().addTransaction({
          type: 'Supply',
          summary: `Supplied ${amount} ${assetTicker} to funding pool.`,
          details: { asset: assetTicker, amount }
        });
      }
      return result;
    },
    withdrawAsset: (assetTicker, amount) => {
      const result = originalFundingActions.withdrawAsset(assetTicker, amount);
      if (result) {
        getTransactionActions().addTransaction({
          type: 'Withdraw',
          summary: `Withdrew ${amount} ${assetTicker} from funding pool.`,
          details: { asset: assetTicker, amount }
        });
      }
      return result;
    },
    borrowAsset: (assetTicker, amount) => {
      const result = originalFundingActions.borrowAsset(assetTicker, amount);
      if (result) {
        getTransactionActions().addTransaction({
          type: 'Borrow',
          summary: `Borrowed ${amount} ${assetTicker} from funding pool.`,
          details: { asset: assetTicker, amount }
        });
      }
      return result;
    },
    repayAsset: (assetTicker, amount) => {
      const result = originalFundingActions.repayAsset(assetTicker, amount);
      if (result) {
        getTransactionActions().addTransaction({
          type: 'Repay',
          summary: `Repaid ${amount} ${assetTicker} to funding pool.`,
          details: { asset: assetTicker, amount }
        });
      }
      return result;
    }
  }
}));


export default useFundingStore;
