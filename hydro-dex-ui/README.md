# Hydro DEX UI

This project is the frontend user interface for the Hydro Protocol, a decentralized exchange and financial platform. It provides users with tools to interact with various DeFi functionalities offered by the Hydro smart contracts.

**Note:** This UI is currently set up to work with **mock data and simulated interactions by default**. To connect to actual smart contracts (even on a local testnet), please follow the "Smart Contract Interaction Setup" section carefully.

## Features

*   **Spot Trading:** Interface for placing limit and market orders (mocked execution). Includes:
    *   Trading pair selection.
    *   Order book display (mock data).
    *   Trade history display (mock data).
    *   Price charts (mock data).
*   **Funding/Lending:** Allows users to supply assets to lending pools and borrow assets against their collateral (mocked).
    *   Supply and withdraw forms.
    *   Borrow and repay forms.
    *   Display of lending markets with APYs and user balances.
    *   User funding summary.
*   **Margin Trading:** Interface for opening leveraged long or short positions (mocked).
    *   Form to open new margin positions with leverage.
    *   Table displaying active margin positions with P&L.
    *   Options to add collateral or close positions (mocked).
*   **Price Charts:** Visual representation of price history for trading pairs (mock data).
*   **Transaction History:** A global log of user actions performed within the application.
*   **Wallet Integration:** Connects to Ethereum wallets using Web3Modal and ethers.js.

## Prerequisites

*   **Node.js and npm:** Ensure you have Node.js (which includes npm) installed. You can download it from [nodejs.org](https://nodejs.org/). (LTS version recommended)
*   **Access to Hydro Protocol Smart Contracts:** This UI is the frontend part of a larger project. You will need the main Hydro Protocol smart contract repository.

## Setup & Installation

1.  **Clone the Repository:** If you haven't already, clone the main Hydro Protocol repository which should include this `hydro-dex-ui` directory.
2.  **Navigate to UI Directory:**
    ```bash
    cd path/to/hydro-protocol/hydro-dex-ui
    ```
3.  **Install Dependencies:**
    ```bash
    npm install
    ```
    This will install all necessary dependencies for the UI, including React, Material-UI, Zustand, Ethers.js, etc.

    **Note on Specific Libraries:**
    *   **Charting:** This project uses `lightweight-charts` for price charts.
    *   **Testing:** Testing libraries include `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, and `@testing-library/user-event`.
    If `npm install` fails or times out in certain environments for these specific packages, you might need to install them individually (e.g., `npm install lightweight-charts`).

## Development

1.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, typically on `http://localhost:5173` (the port might vary). The application will automatically reload if you make changes to the code.

2.  **Project Structure:**
    *   `src/components/`: Reusable React components used across various pages.
    *   `src/pages/`: Top-level components representing different pages/routes of the application (e.g., Spot Trading, Funding, Margin).
    *   `src/services/`: Modules for interacting with external services, primarily `hydroService.js` for blockchain interactions.
    *   `src/store/`: Zustand store modules for global state management (e.g., `marketStore.js`, `fundingStore.js`, `marginStore.js`, `transactionStore.js`).
    *   `src/abis/`: Contains JSON ABI files for the smart contracts. **These need to be populated from the compiled smart contracts.**
    *   `src/test/`: Contains test setup and test files.

## Smart Contract Interaction Setup (Crucial for Real Functionality)

The UI is designed to interact with the Hydro Protocol smart contracts. By default, it uses mock data and simulates blockchain interactions via functions in `hydroService.js`. To connect to actual deployed smart contracts (e.g., on a local testnet like Ganache, or a public testnet), you **must** perform the following steps:

1.  **Compile Smart Contracts:**
    *   Navigate to the root directory of the main Hydro Protocol project (the parent of `hydro-dex-ui`).
    *   Ensure all smart contract development dependencies are installed (e.g., `npm install` in the root).
    *   Compile the contracts:
        ```bash
        # In the root of the Hydro Protocol project
        npm run compile 
        # or the specific command used by the project, e.g., truffle compile
        ```
    This will typically generate JSON ABI files in a `build/contracts/` directory in the root project.

2.  **Deploy Smart Contracts:**
    *   Deploy the compiled contracts to your chosen Ethereum network (e.g., local Ganache, Sepolia testnet, etc.).
    *   If using Truffle, an example for a local development network might be:
        ```bash
        # In the root of the Hydro Protocol project
        truffle migrate --network development --reset
        ```
    *   Note down the deployed addresses of the key contracts (`Hydro`, `Exchange`, `LendingPool`, `CollateralAccounts`, `PriceOracleProxy`, etc.).

3.  **Copy ABI Files:**
    *   Copy the required JSON ABI files from the parent project's build output (e.g., `build/contracts/`) into the `hydro-dex-ui/src/abis/` directory. The key files needed are:
        *   `Hydro.json`
        *   `Exchange.json`
        *   `LendingPool.json`
        *   `CollateralAccounts.json`
        *   `PriceOracleProxy.json`
        *   `IStandardToken.json` (a generic ERC20 ABI)
    *   **Note:** The UI currently includes placeholder (empty `[]`) ABIs for some of these to allow it to run. You must replace them with the actual ABIs.

4.  **Update Contract Addresses:**
    *   Open the file `hydro-dex-ui/src/services/hydroService.js`.
    *   At the top of the file, you will find a `contractAddresses` object.
    *   Replace the placeholder addresses (e.g., `'0x...'`) with the actual addresses of your deployed smart contracts from step 2.

**Without completing these steps, the UI will not interact with any real smart contracts and will rely on its internal mock logic and data.**

## Testing

1.  **Run Unit Tests:**
    ```bash
    npm test
    ```
    This command runs the unit tests using Vitest. Test files are located alongside the components/stores they test or in the `src/test` directory.

2.  **End-to-End (E2E) Testing:**
    *   For comprehensive E2E testing, ensure the entire Hydro Protocol (smart contracts and UI) is set up correctly on a test network.
    *   Refer to the main project's documentation or the `DEPLOYMENT_GUIDE.md` in the root of the main Hydro project for details on setting up a full E2E test environment.

## Building for Production

1.  **Create a Production Build:**
    ```bash
    npm run build
    ```
    This command creates an optimized static build of the application in the `dist` directory.

2.  **Deployment:**
    *   For instructions on how to deploy the contents of the `dist` folder to a web server or hosting platform, please refer to the `DEPLOYMENT_GUIDE.md` file located in this `hydro-dex-ui` directory.

---

Thank you for using the Hydro DEX UI!
