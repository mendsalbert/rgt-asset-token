<img src='https://i.postimg.cc/8PDmC5V8/Screenshot-2024-07-21-at-6-21-56-PM.png'>

## Documentation for Asset Token Tester

### Overview

The Asset Token Tester application is a React-based web interface for interacting with a smart contract on the Avalanche Fuji C-Chain. The application allows users to deposit tokens (in multiples of 10) and claim rewards. The interface is designed in dark mode with a modern look.

### Installation

To run the application, follow these steps:

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Run the Application**:
   ```bash
   npm start
   ```

### Project Structure

- **App.js**: The main React component that handles the UI and interaction with the smart contract.
- **styles.css**: The CSS file for styling the application.
- **artifacts/AssetToken.json**: The ABI file for the smart contract.

### App.js

#### State Variables

- `account`: Stores the user's wallet address.
- `assets`: Stores the number of assets deposited by the user.
- `rewards`: Stores the reward amount for the user.
- `error`: Stores error messages for display.
- `provider`: Stores the ethers provider instance.
- `signer`: Stores the ethers signer instance.
- `contract`: Stores the contract instance.
- `depositAmount`: Stores the amount to be deposited by the user.

#### Functions

1. **`loadAccount`**: Connects to the user's MetaMask wallet and sets the account state.

   ```javascript
   useEffect(() => {
     async function loadAccount() {
       try {
         if (window.ethereum) {
           const chainIdHex = await window.ethereum.request({
             method: "eth_chainId",
           });
           if (chainIdHex !== chainId) {
             await window.ethereum.request({
               method: "wallet_addEthereumChain",
               params: [
                 {
                   chainId,
                   chainName,
                   nativeCurrency,
                   rpcUrls: [rpcUrl],
                   blockExplorerUrls: [
                     "https://cchain.explorer.avax-test.network",
                   ],
                 },
               ],
             });
           }
           const accounts = await window.ethereum.request({
             method: "eth_requestAccounts",
           });
           setAccount(accounts[0]);
         } else {
           setError("MetaMask is not installed");
         }
       } catch (error) {
         console.error("Could not connect to Avalanche Fuji C-Chain:", error);
         setError("Could not connect to Avalanche Fuji C-Chain");
       }
     }
     loadAccount();
   }, []);
   ```

2. **`loadEthers`**: Initializes ethers.js with the provider and signer and sets the contract instance.

   ```javascript
   useEffect(() => {
     async function loadEthers() {
       try {
         const provider = new ethers.providers.Web3Provider(window.ethereum);
         setProvider(provider);
         const signer = provider.getSigner();
         setSigner(signer);
         const contract = new ethers.Contract(
           contractAddress,
           contractABI.abi,
           signer
         );
         setContract(contract);
       } catch (error) {
         setError("Failed to load ethers or contract");
         console.error("Failed to load ethers or contract:", error);
       }
     }
     if (account) {
       loadEthers();
     }
   }, [account]);
   ```

3. **`depositTokens`**: Deposits the specified amount of tokens into the contract.

   - Validates that the deposit amount is a positive multiple of 10.

   ```javascript
   const depositTokens = async () => {
     if (depositAmount % 10 !== 0 || depositAmount <= 0) {
       setError("Deposit amount must be a positive multiple of 10");
       return;
     }
     try {
       const tx = await contract.deposit(
         ethers.utils.parseUnits(depositAmount.toString(), 18)
       );
       await tx.wait();
       setError("");
       setDepositAmount("");
       getAssetsAndRewards();
     } catch (error) {
       console.error("Deposit failed:", error);
       setError("Deposit failed");
     }
   };
   ```

4. **`claimRewards`**: Claims the rewards for the user.

   ```javascript
   const claimRewards = async () => {
     try {
       const tx = await contract.claimReward();
       await tx.wait();
       getAssetsAndRewards();
     } catch (error) {
       console.error("Claim rewards failed:", error);
       setError("Claim rewards failed");
     }
   };
   ```

5. **`getAssetsAndRewards`**: Fetches the assets and rewards information for the user.

   ```javascript
   const getAssetsAndRewards = async () => {
     try {
       const assetData = await contract.assets(account);
       const rewardData = await contract.calculateReward(account);
       setAssets(assetData.amount.toNumber());
       setRewards(ethers.utils.formatUnits(rewardData, 18));
     } catch (error) {
       console.error("Fetching assets and rewards failed:", error);
       setError("Fetching assets and rewards failed");
     }
   };
   ```

6. **`shortenAddress`**: Shortens the wallet address for display.
   ```javascript
   const shortenAddress = (address) => {
     return `${address.slice(0, 6)}...${address.slice(-4)}`;
   };
   ```

#### UI Layout

- **Container**: Holds the entire application content.
- **Title**: Displays the application title.
- **Icon Placeholder**: Placeholder for future icons.
- **Info**: Displays the account, assets, and rewards information in a row.
- **Form**: Contains the input field for the deposit amount and buttons for deposit and claim rewards.

```jsx
return (
  <div className="App dark-mode">
    <div className="container">
      <h1 className="title">Asset Token Tester</h1>
      <div className="icon-placeholder">Icons go here</div>
      <div className="info">
        <p>
          <strong>Account:</strong> {shortenAddress(account)}
        </p>
        <p>
          <strong>Assets:</strong> {assets}
        </p>
        <p>
          <strong>Rewards:</strong> {rewards}
        </p>
      </div>
      {error && <div className="error">{error}</div>}
      <div className="form">
        <input
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder="Deposit Amount (multiple of 10)"
          className="input"
        />
        <button onClick={depositTokens} className="button primary">
          <svg
            className="button-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 10h11M12 6l4 4-4 4m8 2h2a2 2 0 002-2V4a2 2 0 00-2-2h-8a2 2 0 00-2 2v2m2 2l4-4-4-4M4 16h16"
            />
          </svg>
          Deposit
        </button>
        <button onClick={claimRewards} className="button secondary">
          <svg
            className="button-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8c-3.333 0-6 2.667-6 6s2.667 6 6 6 6-2.667 6-6-2.667-6-6-6zM12 8V4M12 8V4m6 8h4m-8 0h4m-8 0H8m0 0H4m0 0H8m0 0h4"
            />
          </svg>
          Claim Rewards
        </button>
      </div>
    </div>
  </div>
);
```

### styles.css

```css
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap");

body {
  font-family: "Poppins", sans-serif;
  background-color: #121212;
  margin: 0;
  padding: 0;
  color: #e0e0e0;
}

.App {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.container {
  background-color: #1e1e1e;
  padding: 26px;
  border-radius: 20px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  text-align: center;
  width: 100%;
  max-width: 600px;
}

.title {
  margin-bottom: 20px;
  color: #fff;
}

.icon-placeholder {
  margin-bottom: 20px;
  color: #aaa;
}

.info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.info p {
  margin: 0;
  padding: 0 10px;
}

.error {
  color: #ff6b6b;
  margin-bottom: 20px;
}

.form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.input {
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid #333;
  border-radius: 20px;
  font-size: 20px;
  width: 95%;
  background-color: #333;
  color: #fff;
}

.button {
  padding: 15px 20px;
  margin: 5px;
  font-size: 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  width: 100%;
}

.button.primary {
  background-color: #1e88e5;
  color: white;
}

.button.secondary {
  background-color: #43a047;
  color: white;
}

.button.primary:hover {
  background-color: #1565c0;
}

.button.secondary:hover {
  background-color: #2e7d32;
}

.button-icon {
  margin-right: 10px;
}
```

### Functionality Verification

1. **Connect to MetaMask**: Ensure MetaMask is installed and connected to the Avalanche Fuji C-Chain.
2. **Load Account**: Verify that the account is loaded correctly and displayed in the shortened format.
3. **Deposit Tokens**: Enter a deposit amount (multiple of 10) and verify that the transaction is processed and the assets are updated.
4. **Claim Rewards**: Click the "Claim Rewards" button and verify that the rewards are updated.
5. **Error Handling**: Ensure that appropriate error messages are displayed for invalid inputs and failed transactions.

### Reasoning Around Implementation

- **Validation**: The deposit amount is validated to be a positive multiple of 10 to ensure contract requirements are met.
- **State Management**: React's state management is used to keep track of user account, assets, rewards, and errors.
- **Styling**: The dark mode styling provides a modern and visually appealing interface.
- **Shortened Address**: The account address is shortened for better readability.
- **Error Handling**: Error messages are displayed to inform the user of any issues with their actions.
