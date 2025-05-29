import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConnectWalletButton from './ConnectWalletButton'; // Adjust path as necessary
import { ethers } from 'ethers'; // To mock its parts
import Web3Modal from 'web3modal'; // To mock it

// Mock Web3Modal
vi.mock('web3modal', () => {
  // Mock the constructor and its methods
  const mockInstance = {
    connect: vi.fn(),
    on: vi.fn(), // Ensure 'on' is part of the mock if your component uses it directly on the instance
    cachedProvider: null, // Mock property
    clearCachedProvider: vi.fn(),
  };
  return {
    default: vi.fn(() => mockInstance), // Mock the default export which is the constructor
  };
});

// Mock ethers.js
// We only need to mock `ethers.providers.Web3Provider` and its methods used in the component
vi.mock('ethers', async (importOriginal) => {
  const actualEthers = await importOriginal(); // Import actual ethers to keep other parts if needed
  return {
    ...actualEthers, // Spread actual ethers if you need other functionalities
    ethers: { // Keep the ethers namespace if your component uses it like `new ethers.providers.Web3Provider`
        ...actualEthers.ethers,
        providers: {
            ...actualEthers.ethers.providers,
            Web3Provider: vi.fn().mockImplementation(() => ({
                getSigner: vi.fn(() => ({
                    getAddress: vi.fn().mockResolvedValue('0xMockAddress'),
                })),
                getNetwork: vi.fn().mockResolvedValue({ name: 'ropsten', chainId: 3 }),
            })),
        },
    },
  };
});


describe('ConnectWalletButton', () => {
  let web3ModalMockInstance;

  beforeEach(() => {
    // Get the mock instance of Web3Modal
    web3ModalMockInstance = new Web3Modal();
    // Reset mocks before each test
    web3ModalMockInstance.connect.mockReset();
    web3ModalMockInstance.on.mockReset(); // Reset 'on' if it's used for event handling
    
    // Also reset mocks on the ethers.providers.Web3Provider if necessary, though instance-based mocks are trickier.
    // The vi.fn() in the mock definition usually handles reset if they are called again.
    // If Web3Provider itself was stateful and you needed to reset its internal state, that's harder.
    // For this component, the mocked getSigner and getNetwork should be fresh per new Web3Provider() call.
  });

  afterEach(() => {
    vi.clearAllMocks(); // Clears all information stored in mocks (like number of calls)
  });

  it('renders "Connect Wallet" button initially', () => {
    render(<ConnectWalletButton />);
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument();
  });

  it('attempts to connect when "Connect Wallet" button is clicked', async () => {
    render(<ConnectWalletButton />);
    const connectButton = screen.getByRole('button', { name: /connect wallet/i });
    
    // Mock the successful connection
    const mockProviderInstance = {
      on: vi.fn(), // Mock the 'on' method for the provider instance returned by web3Modal.connect()
      removeListener: vi.fn(), // If you use removeListener
    };
    web3ModalMockInstance.connect.mockResolvedValue(mockProviderInstance);

    await userEvent.click(connectButton);

    expect(web3ModalMockInstance.connect).toHaveBeenCalledTimes(1);
    // Check if ethers.providers.Web3Provider was called
    // This depends on how you've mocked ethers. If it's a single global mock, this check is harder.
    // If ethers.providers.Web3Provider is vi.fn(), we can check:
    await waitFor(() => {
      expect(ethers.providers.Web3Provider).toHaveBeenCalledWith(mockProviderInstance);
    });
  });

  it('displays account address and network name when connected', async () => {
    // Mock a successful connection and provider setup
    const mockProviderEvents = { on: vi.fn(), removeListener: vi.fn() };
    web3ModalMockInstance.connect.mockResolvedValue(mockProviderEvents);

    // The mock for ethers.providers.Web3Provider should return the expected values
    // This is already set up in the global mock

    render(<ConnectWalletButton />);
    const connectButton = screen.getByRole('button', { name: /connect wallet/i });
    await userEvent.click(connectButton);

    // Wait for the UI to update with address and network
    await waitFor(() => {
      expect(screen.getByText(/connected: 0xMock...ress/i)).toBeInTheDocument();
      expect(screen.getByText(/network: ropsten/i)).toBeInTheDocument();
    });
  });
  
   it('subscribes to accountsChanged and chainChanged events', async () => {
    const mockProviderInstance = {
      on: vi.fn(), // This is the crucial part for event subscription
      removeListener: vi.fn(),
    };
    web3ModalMockInstance.connect.mockResolvedValue(mockProviderInstance);

    render(<ConnectWalletButton />);
    const connectButton = screen.getByRole('button', { name: /connect wallet/i });
    await userEvent.click(connectButton);

    await waitFor(() => {
      // Check that 'on' was called on the provider instance returned by web3Modal.connect()
      expect(mockProviderInstance.on).toHaveBeenCalledWith("accountsChanged", expect.any(Function));
      expect(mockProviderInstance.on).toHaveBeenCalledWith("chainChanged", expect.any(Function));
    });
  });

  it('tries to connect with cached provider on mount', async () => {
    web3ModalMockInstance.cachedProvider = true; // Simulate cached provider
    const mockProviderInstance = { on: vi.fn(), removeListener: vi.fn() };
    web3ModalMockInstance.connect.mockResolvedValue(mockProviderInstance); // Ensure connect resolves

    render(<ConnectWalletButton />);

    await waitFor(() => {
        expect(web3ModalMockInstance.connect).toHaveBeenCalledTimes(1);
        expect(screen.getByText(/connected: 0xMock...ress/i)).toBeInTheDocument();
    });
  });

});
