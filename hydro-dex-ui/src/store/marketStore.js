import { create } from 'zustand';

const mockTradingPairs = [
  { id: 'WETH-DAI', base: 'WETH', quote: 'DAI', baseDecimals: 18, quoteDecimals: 18 },
  { id: 'HYDRO-WETH', base: 'HYDRO', quote: 'WETH', baseDecimals: 18, quoteDecimals: 18 },
  // Add more mock pairs if needed
];

const useMarketStore = create((set) => ({
  tradingPairs: mockTradingPairs,
  selectedPair: mockTradingPairs[0], // Default to the first pair
  actions: {
    setSelectedPair: (pairId) => {
      const pair = mockTradingPairs.find(p => p.id === pairId);
      if (pair) {
        set({ selectedPair: pair });
      }
    },
  },
}));

export default useMarketStore;

// Selector hook for actions to prevent unnecessary re-renders if only actions are used.
// See Zustand docs: https://github.com/pmndrs/zustand#selecting-multiple-state-slices
export const useMarketActions = () => useMarketStore((state) => state.actions);

// Example mock balances - these could also be part of a different store or this one
export const mockBalances = {
  'WETH': '10.5', // Mock WETH balance
  'DAI': '5000',   // Mock DAI balance
  'HYDRO': '100000', // Mock HYDRO balance
};
