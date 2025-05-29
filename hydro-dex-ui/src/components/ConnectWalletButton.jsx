import React, { useState, useEffect } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';

const ConnectWalletButton = () => {
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [provider, setProvider] = useState(null);

  const web3Modal = new Web3Modal({
    network: 'mainnet', // optional
    cacheProvider: true, // optional
    providerOptions: {}, // required
  });

  const connectWallet = async () => {
    try {
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      setProvider(provider);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      const networkData = await provider.getNetwork();
      setNetwork(networkData.name);

      // Subscribe to accountsChanged event
      instance.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
          setNetwork(null);
        }
      });

      // Subscribe to chainChanged event
      instance.on("chainChanged", (chainId) => {
        window.location.reload();
      });

    } catch (error) {
      console.error("Could not connect to wallet:", error);
    }
  };

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  return (
    <div>
      {account ? (
        <div>
          <p>Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
          <p>Network: {network}</p>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default ConnectWalletButton;
