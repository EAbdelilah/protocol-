import { create } from 'zustand';

let txIdCounter = 0;

const useTransactionStore = create((set, get) => ({
  transactions: [], // Stores all transactions
  actions: {
    addTransaction: (transactionDetails) => {
      txIdCounter += 1;
      const newTransaction = {
        id: `tx_${Date.now()}_${txIdCounter}`,
        status: 'Completed', // Default for mocks
        timestamp: new Date().toISOString(),
        ...transactionDetails, // type, summary, any other specific data
      };
      set((state) => ({
        transactions: [newTransaction, ...state.transactions], // Prepend new transactions
      }));
      console.log('[TransactionStore] Added Transaction:', newTransaction);
      return newTransaction;
    },
    // Future: clearTransactions, setTransactionStatus, etc.
  },
}));

export const useTransactionActions = () => useTransactionStore((state) => state.actions);

export default useTransactionStore;
