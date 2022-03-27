import {
	HStack,
	Text,
	Button,
	Input,
	InputGroup,
	InputLeftElement,
	Image,
} from "@chakra-ui/react";
import Link from "next/link";
import { HiOutlineSearch } from "react-icons/hi";
import ConnectWallet from "./ConnectWallet";
import { useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import { ProfileMenu } from "./ProfileMenu";
import UploadButton from "./UploadButton";
import { RootContext } from "../pages/_app";

export default function Header() {
	const { account } = useContext(Web3Context);
	const { uploadModalOnOpen } = useContext(RootContext);

	return (
		<HStack
			justifyContent="space-between"
			px={5}
			py={4}
			zIndex="1000"
			background="white"
			width="100%"
			borderWidth="1px"
			position="fixed"
		>
			<HStack>
				<Link href="/">
					<Image
						style={{ cursor: "pointer" }}
						width="200px"
						src="/LENSTUBE.png"
					/>
				</Link>
			</HStack>

			<HStack>
				{account ? (
					<HStack>
						<Button onClick={uploadModalOnOpen}>Upload</Button>
						<ProfileMenu />
					</HStack>
				) : (
					<ConnectWallet />
				)}
			</HStack>
		</HStack>
	);
}
