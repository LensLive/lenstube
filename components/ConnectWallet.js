import { useContext, useState } from "react";
import { Button } from "@chakra-ui/react";
import { Web3Context } from "../context/Web3Context";

export default function ConnectWallet() {
	const { connect, connectingAccount } = useContext(Web3Context);
	const [loadingText, setLoadingText] = useState("Loading...");

	return (
		<Button
			isLoading={connectingAccount}
			onClick={connect}
			loadingText={loadingText}
			maxWidth="200px"
		>
			Connect Wallet
		</Button>
	);
}
