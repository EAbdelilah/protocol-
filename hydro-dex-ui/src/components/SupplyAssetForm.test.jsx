import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SupplyAssetForm from './SupplyAssetForm'; // Adjust path
import useFundingStore, { mockWalletBalances } from '../store/fundingStore'; // Adjust path
import * as hydroService from '../services/hydroService'; // To mock its functions

// Mock hydroService
vi.mock('../services/hydroService', () => ({
  mockSupplyAsset: vi.fn(),
}));

// Mock fundingStore
// We need to control the state returned by the hook and mock actions
const mockSupplyAssetAction = vi.fn();
const mockFundingAssets = [
  { asset: 'DAI', supplyApy: '5%', userSupplied: '0', userSuppliedUsd: '0' },
  { asset: 'WETH', supplyApy: '3%', userSupplied: '0', userSuppliedUsd: '0' },
];
// Original mockWalletBalances from fundingStore
const originalMockWalletBalances = { ...mockWalletBalances };

beforeEach(() => {
  // Reset store state and actions for each test
  useFundingStore.setState({
    fundingAssets: mockFundingAssets,
    actions: {
      ...useFundingStore.getState().actions, // Keep other actions if any
      supplyAsset: mockSupplyAssetAction,
    },
  });
  // Reset wallet balances for each test
  for (const key in mockWalletBalances) {
    delete mockWalletBalances[key];
  }
  Object.assign(mockWalletBalances, originalMockWalletBalances);

  // Reset service mocks
  hydroService.mockSupplyAsset.mockReset();
  mockSupplyAssetAction.mockReset();
});

describe('SupplyAssetForm', () => {
  it('renders correctly with initial state', () => {
    render(<SupplyAssetForm />);
    expect(screen.getByText('Supply Assets')).toBeInTheDocument();
    expect(screen.getByLabelText('Asset')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount to Supply')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /supply asset/i })).toBeDisabled(); // Disabled initially
  });

  it('enables submit button when asset and amount are provided', async () => {
    render(<SupplyAssetForm />);
    
    // Select an asset (Material UI Select requires careful interaction)
    const assetSelect = screen.getByLabelText('Asset');
    await userEvent.click(assetSelect);
    // Assuming 'DAI' is an option based on mockFundingAssets
    await userEvent.click(screen.getByRole('option', { name: /dai/i })); 

    // Type an amount
    const amountInput = screen.getByLabelText('Amount to Supply');
    await userEvent.type(amountInput, '100');

    expect(screen.getByRole('button', { name: /supply dai/i })).toBeEnabled();
  });

  it('calls mockSupplyAsset and store action on valid submission', async () => {
    hydroService.mockSupplyAsset.mockResolvedValue({ 
      success: true, 
      message: 'Successfully supplied', 
      transactionHash_mock: '0x123' 
    });
    mockSupplyAssetAction.mockReturnValue(true); // Simulate store update success

    render(<SupplyAssetForm />);

    // Select DAI
    await userEvent.click(screen.getByLabelText('Asset'));
    await userEvent.click(screen.getByRole('option', { name: /dai/i }));
    
    // Enter amount
    const amountInput = screen.getByLabelText('Amount to Supply');
    await userEvent.type(amountInput, '50'); // Wallet balance for DAI is 1000

    // Click supply
    const supplyButton = screen.getByRole('button', { name: /supply dai/i });
    await userEvent.click(supplyButton);

    await waitFor(() => {
      expect(hydroService.mockSupplyAsset).toHaveBeenCalledTimes(1);
      expect(hydroService.mockSupplyAsset).toHaveBeenCalledWith('DAI', '50');
    });
    
    await waitFor(() => {
      expect(mockSupplyAssetAction).toHaveBeenCalledTimes(1);
      expect(mockSupplyAssetAction).toHaveBeenCalledWith('DAI', '50');
    });

    // Check for success message (example)
    expect(await screen.findByText(/successfully supplied/i)).toBeInTheDocument();
  });

  it('shows error if wallet balance is insufficient', async () => {
    render(<SupplyAssetForm />);
    await userEvent.click(screen.getByLabelText('Asset'));
    await userEvent.click(screen.getByRole('option', { name: /dai/i }));
    
    // Wallet balance for DAI is 1000
    await userEvent.type(screen.getByLabelText('Amount to Supply'), '2000'); 
    
    await userEvent.click(screen.getByRole('button', { name: /supply dai/i }));

    expect(await screen.findByText(/insufficient wallet balance/i)).toBeInTheDocument();
    expect(hydroService.mockSupplyAsset).not.toHaveBeenCalled();
    expect(mockSupplyAssetAction).not.toHaveBeenCalled();
  });

  it('shows error if service call fails', async () => {
    hydroService.mockSupplyAsset.mockResolvedValue({ 
      success: false, 
      message: 'Service failure' 
    });

    render(<SupplyAssetForm />);
    await userEvent.click(screen.getByLabelText('Asset'));
    await userEvent.click(screen.getByRole('option', { name: /dai/i }));
    await userEvent.type(screen.getByLabelText('Amount to Supply'), '50');
    await userEvent.click(screen.getByRole('button', { name: /supply dai/i }));

    await waitFor(() => {
      expect(hydroService.mockSupplyAsset).toHaveBeenCalledTimes(1);
    });
    expect(await screen.findByText(/error: service failure/i)).toBeInTheDocument();
    expect(mockSupplyAssetAction).not.toHaveBeenCalled();
  });
  
  it('displays wallet balance for selected asset', async () => {
    render(<SupplyAssetForm />);
    await userEvent.click(screen.getByLabelText('Asset'));
    await userEvent.click(screen.getByRole('option', { name: /weth/i })); // WETH balance is 5

    // Check if wallet balance is displayed
    // The text might be split across elements, so using a regex or more flexible query might be needed
    expect(await screen.findByText(/wallet balance: 5 weth/i, { exact: false })).toBeInTheDocument();
  });

});
