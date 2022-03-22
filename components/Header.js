import {
	HStack,
	Text,
	Button,
	Input,
	InputGroup,
	InputLeftElement,
	Menu,
	MenuList,
	MenuItem,
	Image,
	MenuButton,
	MenuDivider,
	MenuGroup,
} from "@chakra-ui/react";
import Link from "next/link";
import { HiOutlineSearch } from "react-icons/hi";
import ConnectWallet from "./ConnectWallet";
import { useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import { ProfileMenu } from "./ProfileMenu";

export default function Header() {
	const { account } = useContext(Web3Context);

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
					<Text>LensLive</Text>
				</Link>
				<Button variant="ghost">Explore</Button>
			</HStack>
			<InputGroup maxWidth="500px">
				<InputLeftElement>
					<HiOutlineSearch color="var(--chakra-colors-purple-500)" />
				</InputLeftElement>
				<Input placeholder="Search Profiles or Videos" />
			</InputGroup>
			<HStack>{account ? <ProfileMenu /> : <ConnectWallet />}</HStack>
		</HStack>
	);
}
