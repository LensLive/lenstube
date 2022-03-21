import React, { useEffect, useState } from "react";
import { createStandaloneToast } from "@chakra-ui/react";
import { providers } from "ethers";

export const Web3Context = React.createContext();

const validNetworkOptions = {
	chainId: "0x13881",
	chainName: "Mumbai Testnet",
	nativeCurrency: { name: "Matic", symbol: "MATIC", decimals: 18 },
	rpcUrls: ["https://rpc-mumbai.matic.today"],
	blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
};

function Web3ContextProvider({ children }) {
	const [isMetamaskInstalled, setIsMetamaskInstalled] = useState(null);
	const [connectingAccount, setConnectingAccount] = useState(null);
	const [account, setAccount] = useState(null);
	const [chainId, setChainId] = useState(null);
	const [wallet, setWallet] = useState(null);

	useEffect(() => {
		if (isMetamaskInstalled !== undefined) {
			setWallet(new providers.Web3Provider(window.ethereum));

			window.ethereum.on("chainChanged", (chainId) => {
				window.location.reload();
			});

			window.ethereum.on("accountsChanged", (accounts) => {
				setAccount(accounts[0]);
				setWallet(new providers.Web3Provider(window.ethereum));
			});
		} else {
			setIsMetamaskInstalled(false);
		}
	}, []);

	useEffect(() => {
		async function requestChainId() {
			const chainId = await window.ethereum.request({
				method: "net_version",
			});
			setChainId(chainId);
		}
		if (window.ethereum !== undefined) {
			requestChainId();
		}
	}, []);

	useEffect(() => {
		if (isMetamaskInstalled === true) {
			if (checkNetwork(window.ethereum, "80001") !== true) {
				requestNetworkChange(validNetworkOptions);
			}
		}
	}, [isMetamaskInstalled]);

	async function checkNetwork(provider, targetChainId) {
		return provider.networkVersion === targetChainId;
	}

	async function requestNetworkChange(networkConfig) {
		window.ethereum.request({
			method: "wallet_addEthereumChain",
			params: [networkConfig],
		});
	}

	async function connect() {
		if (isMetamaskInstalled === true) {
			setConnectingAccount(true);
			window.ethereum
				.request({
					method: "eth_requestAccounts",
				})
				.then((accounts) => {
					setAccount(accounts[0]);
				})
				.catch((error) => {
					toast({
						title: "User rejected",
						description: "User rejected connection",
						status: "error",
						position: "bottom-right",
						variant: "left-accent",
						isClosable: true,
					});
				})
				.finally(() => {
					setConnectingAccount(false);
				});
		}
	}

	return (
		<Web3Context.Provider
			value={{
				isMetamaskInstalled,
				chainId,
				connect,
				connectingAccount,
				account,
				wallet,
			}}
		>
			{children}
		</Web3Context.Provider>
	);
}

export default Web3ContextProvider;
