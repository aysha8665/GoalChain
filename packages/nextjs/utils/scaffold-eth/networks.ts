import { Network } from "@ethersproject/networks";
import * as chains from "wagmi/chains";
import scaffoldConfig from "~~/scaffold.config";

export type TChainAttributes = {
  // color | [lightThemeColor, darkThemeColor]
  color: string | [string, string];
  tokenAddress?: string;
};

export const NETWORKS_EXTRA_DATA: Record<string, TChainAttributes> = {
  [chains.hardhat.id]: {
    color: "#b8af0c",
    tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  [chains.mainnet.id]: {
    color: "#ff8b9e",
    tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  [chains.sepolia.id]: {
    color: ["#5f4bb6", "#87ff65"],
    tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  [chains.goerli.id]: {
    color: "#0975F6",
    tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  [chains.gnosis.id]: {
    color: "#48a9a6",
    tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  [chains.polygon.id]: {
    color: "#2bbdf7",
    tokenAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
  },
  [chains.polygonMumbai.id]: {
    color: "#92D9FA",
    tokenAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
  },
  [chains.optimismGoerli.id]: {
    color: "#f01a37",
    tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  [chains.optimism.id]: {
    color: "#f01a37",
    tokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  },
  [chains.arbitrumGoerli.id]: {
    color: "#28a0f0",
    tokenAddress: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1",
  },
  [chains.arbitrum.id]: {
    color: "#28a0f0",
    tokenAddress: "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1",
  },
  [chains.fantom.id]: {
    color: "#1969ff",
    tokenAddress: "0x4E15361FD6b4BB609Fa63C81A2be19d873717870",
  },
  [chains.fantomTestnet.id]: {
    color: "#1969ff",
    tokenAddress: "0x4E15361FD6b4BB609Fa63C81A2be19d873717870",
  },
};

/**
 * Gives the block explorer transaction URL.
 * @param network
 * @param txnHash
 * @dev returns empty string if the network is localChain
 */
export function getBlockExplorerTxLink(network: Network, txnHash: string) {
  const { chainId } = network;

  const chainNames = Object.keys(chains);

  const targetChainArr = chainNames.filter(chainName => {
    const wagmiChain = chains[chainName as keyof typeof chains];
    return wagmiChain.id === chainId;
  });

  if (targetChainArr.length === 0) {
    return "";
  }

  const targetChain = targetChainArr[0] as keyof typeof chains;
  // @ts-expect-error : ignoring error since `blockExplorers` key may or may not be present on some chains
  const blockExplorerTxURL = chains[targetChain]?.blockExplorers?.default?.url;

  if (!blockExplorerTxURL) {
    return "";
  }

  return `${blockExplorerTxURL}/tx/${txnHash}`;
}

/**
 * Gives the block explorer Address URL.
 * @param network - wagmi chain object
 * @param address
 * @returns block explorer address URL and etherscan URL if block explorer URL is not present for wagmi network
 */
export function getBlockExplorerAddressLink(network: chains.Chain, address: string) {
  const blockExplorerBaseURL = network.blockExplorers?.default?.url;
  if (!blockExplorerBaseURL) {
    return `https://etherscan.io/address/${address}`;
  }

  return `${blockExplorerBaseURL}/address/${address}`;
}

/**
 * @returns targetNetwork object consisting targetNetwork from scaffold.config and extra network metadata
 */

export function getTargetNetwork(): chains.Chain & Partial<TChainAttributes> {
  const configuredNetwork = scaffoldConfig.targetNetwork;

  return {
    ...configuredNetwork,
    ...NETWORKS_EXTRA_DATA[configuredNetwork.id],
  };
}
