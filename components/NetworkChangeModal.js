import { useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
} from "@chakra-ui/react";

export default function NetworkChangeModal() {
	const { chainId } = useContext(Web3Context);
	return (
		<Modal isOpen={chainId !== undefined && chainId !== "80001"}>
			<ModalOverlay />
			<ModalContent alignItems="center">
				<ModalHeader>Connected to Invalid Network</ModalHeader>
				<ModalBody>Please connect to Mumbai Testnet</ModalBody>
			</ModalContent>
		</Modal>
	);
}
