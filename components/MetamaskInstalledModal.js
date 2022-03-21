import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Link,
	Button,
} from "@chakra-ui/react";
import { useContext } from "react";
import { Web3Context } from "../context/Web3Context";

export default function MetamaskInstalledModal() {
	const { isMetamaskInstalled } = useContext(Web3Context);
	return (
		<Modal isOpen={isMetamaskInstalled === false}>
			<ModalOverlay />
			<ModalContent alignItems="center">
				<ModalHeader>Please Install Metamask</ModalHeader>
				<ModalFooter>
					<Link href="https://metamask.io/" target="_blank">
						<Button>Install Metamask</Button>
					</Link>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
