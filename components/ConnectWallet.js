import { useContext } from "react";
import { Button } from "@chakra-ui/react";
import { Web3Context } from "../context/Web3Context";

export default function ConnectWallet() {
	const { connect } = useContext(Web3Context);
	const [loadingText, setLoadingText] = useState("Loading...");

	return (
		<Button isLoading={false} onClick={connect} loadingText={loadingText}>
			Connect Wallet
		</Button>
	);
}
