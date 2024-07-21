import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "./artifacts/AssetToken.json"; // Ensure this ABI file is correct and up to date
import "./styles.css"; // Import the CSS file
import { IconAsset, IconCoin, IconUserCircle } from "@tabler/icons-react";

const rpcUrl = "https://api.avax-test.network/ext/bc/C/rpc";
const chainId = "0xA869"; // 43113 in hexadecimal
const chainName = "Avalanche Fuji C-Chain";
const nativeCurrency = {
  name: "Avalanche",
  symbol: "AVAX",
  decimals: 18,
};

const contractAddress = "0x6f9A83e971298DbFA2EbEcACeC6D7AC515Fc00B6"; // Ensure this address is correct

function App() {
  const [account, setAccount] = useState("");
  const [assets, setAssets] = useState(0);
  const [rewards, setRewards] = useState(0);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [depositAmount, setDepositAmount] = useState("");

  console.log(provider, signer);
  useEffect(() => {
    async function loadAccount() {
      try {
        if (window.ethereum) {
          const chainIdHex = await window.ethereum.request({
            method: "eth_chainId",
          });
          if (chainIdHex !== chainId) {
            try {
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
            } catch (addError) {
              if (addError.code === -32002) {
                console.error("Request already pending:", addError);
                setError("Request already pending. Please check MetaMask.");
                return;
              } else {
                throw addError;
              }
            }
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

  useEffect(() => {
    if (account && contract) {
      getAssetsAndRewards();
    }
  }, [account, contract]);

  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="App dark-mode">
      <div className="container">
        <h1 className="title">Asset Token Tester</h1>
        <div className="info">
          <p>
            <IconUserCircle />
            <strong>Account:</strong> {shortenAddress(account)}
          </p>
          <p>
            <IconAsset />
            <strong>Assets:</strong> {assets}
          </p>
          <p>
            <IconCoin />
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
            Deposit
          </button>
          <button onClick={claimRewards} className="button secondary">
            Claim Rewards
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
