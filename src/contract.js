import Web3 from "web3";
import AssetToken from "./artifacts/AssetToken.json";

const web3 = new Web3(Web3.givenProvider);

const contractAddress = "0x6f9A83e971298DbFA2EbEcACeC6D7AC515Fc00B6";
const contract = new web3.eth.Contract(AssetToken.abi, contractAddress);

export default contract;
