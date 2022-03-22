import {
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	MenuGroup,
	MenuDivider,
	Image,
	Button,
	Text,
	VStack,
} from "@chakra-ui/react";
import { FiSettings } from "react-icons/fi";
import { AiOutlineUser } from "react-icons/ai";
import { ApolloContext } from "../context/ApolloContext";
import { useContext } from "react";
import Link from "next/link";

export function ProfileMenu() {
	const { apolloContext, dispatch: apolloDispatch } =
		useContext(ApolloContext);
	const { profiles, currentProfile } = apolloContext;

	return (
		<Menu>
			{profiles && currentProfile !== undefined ? (
				<MenuButton
					as={Button}
					borderRadius="full"
					w="10px"
					overflow="hidden"
					padding={0}
				>
					<Image
						src={profiles[currentProfile].picture}
						alt="pfp"
						w="100%"
					/>
				</MenuButton>
			) : null}
			<MenuList>
				<MenuItem>
					<VStack
						justifyContent="flex-start"
						alignItems="flex-start"
						width="100%"
					>
						<Text>Logged in as </Text>
						{profiles && currentProfile !== undefined ? (
							<Text colorScheme="purple">
								{profiles[currentProfile].handle}
							</Text>
						) : (
							<Text>loading...</Text>
						)}
					</VStack>
				</MenuItem>
				<MenuDivider />
				<MenuGroup title="Account">
					<Link href="/profile">
						<MenuItem icon={<AiOutlineUser />}>
							<Text>Profile</Text>
						</MenuItem>
					</Link>
					<Link href="/settings">
						<MenuItem icon={<FiSettings />}>
							<Text>Settings</Text>
						</MenuItem>
					</Link>
				</MenuGroup>
				<MenuDivider />
				<MenuGroup title="Switch Account">
					<VStack as="ul" maxHeight="300px" overflowY="scroll">
						{profiles
							? profiles.map((profile, index) => {
									return (
										<MenuItem
											onClick={() =>
												apolloDispatch({
													type: "CURRENT_PROFILE",
													payload: index,
												})
											}
											as="li"
											key={profile.id}
										>
											<Image
												w={5}
												mr={3}
												borderRadius="full"
												alt="pfp"
												src={profiles[index].picture}
											/>
											<span>{profile.handle}</span>
										</MenuItem>
									);
							  })
							: null}
					</VStack>
				</MenuGroup>
			</MenuList>
		</Menu>
	);
}
