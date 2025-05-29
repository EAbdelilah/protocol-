import { describe, it, expect, beforeEach, vi } from 'vitest';
import useTransactionStore from './transactionStore'; // Path to your store

// Helper to get a fresh state for each test
const getFreshStore = () => {
  // Resetting the store state for each test
  // Zustand's create typically returns a hook, but we can also access its methods directly for testing
  // For more complex scenarios or if direct reset isn't clean, consider zustand/test-utils
  const store = useTransactionStore;
  const initialState = store.getState();
  store.setState(initialState, true); // Replace state with initial state
  return store;
};


describe('useTransactionStore', () => {
  let store;

  beforeEach(() => {
    store = getFreshStore();
    // Vitest automatically clears mocks, but if you had manual global mocks:
    // vi.restoreAllMocks(); 
  });

  it('should have an empty initial transactions array', () => {
    const transactions = store.getState().transactions;
    expect(transactions).toEqual([]);
  });

  it('addTransaction action should add a new transaction to the list', () => {
    const { addTransaction } = store.getState().actions;
    const initialTransactions = store.getState().transactions;
    expect(initialTransactions.length).toBe(0);

    const mockTxDetails = {
      type: 'Test',
      summary: 'This is a test transaction',
      details: { data: 'test data' },
    };

    const addedTx = addTransaction(mockTxDetails);

    const transactions = store.getState().transactions;
    expect(transactions.length).toBe(1);
    expect(transactions[0]).toEqual(expect.objectContaining({
      id: expect.stringContaining('tx_'),
      status: 'Completed',
      timestamp: expect.any(String), // Or more specific date string matching
      type: 'Test',
      summary: 'This is a test transaction',
      details: { data: 'test data' },
    }));
    expect(transactions[0].id).toBe(addedTx.id); // Check if returned tx matches stored one
  });

  it('addTransaction should prepend new transactions', () => {
    const { addTransaction } = store.getState().actions;

    addTransaction({ type: 'First', summary: 'First one' });
    const firstTxId = store.getState().transactions[0].id;

    addTransaction({ type: 'Second', summary: 'Second one' });
    const transactions = store.getState().transactions;

    expect(transactions.length).toBe(2);
    expect(transactions[0].type).toBe('Second');
    expect(transactions[1].type).toBe('First');
    expect(transactions[1].id).toBe(firstTxId);
  });
  
  it('addTransaction should assign unique IDs', () => {
    const { addTransaction } = store.getState().actions;
    const tx1 = addTransaction({ type: 'Tx1', summary: 'Transaction 1' });
    const tx2 = addTransaction({ type: 'Tx2', summary: 'Transaction 2' });
    expect(tx1.id).not.toBe(tx2.id);
  });

});
