import { Web3Wallet } from "@walletconnect/web3wallet";
import { Core } from "@walletconnect/core";
import { buildApprovedNamespaces, getSdkError } from "@walletconnect/utils";

let web3wallet = null;

export async function initWalletConnect(projectId, metadata) {
  const core = new Core({ projectId });
  web3wallet = await Web3Wallet.init({
    core,
    metadata: metadata || {
      name: "BitSoley Wallet",
      description: "BitSoley Web Wallet",
      url: "https://bitsoley.com",
      icons: ["https://bitsoley.com/icon.png"]
    }
  });
  return web3wallet;
}

export function getWeb3Wallet() {
  return web3wallet;
}

export function buildNamespaces(chainId, address) {
  return buildApprovedNamespaces({
    proposer: { publicKey: "" },
    requiredNamespaces: {
      eip155: {
        methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData", "eth_signTypedData_v4"],
        chains: [`eip155:${chainId}`],
        events: ["accountsChanged", "chainChanged"]
      }
    },
    supportedNamespaces: {},
    granted: {
      eip155: {
        accounts: [`eip155:${chainId}:${address}`],
        methods: ["eth_sendTransaction", "personal_sign", "eth_signTypedData", "eth_signTypedData_v4"],
        events: ["accountsChanged", "chainChanged"]
      }
    }
  });
}

export const SdkError = getSdkError;
