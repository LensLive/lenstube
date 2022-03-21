import {
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	Link,
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

export function ProfileMenu() {
	const { profiles, currentProfile, setCurrentProfile } =
		useContext(ApolloContext);
	return (
		<Menu>
			<MenuButton as={Button}>Profiles</MenuButton>
			<MenuList>
				<MenuItem>
					<VStack
						justifyContent="flex-start"
						alignItems="flex-start"
						width="100%"
					>
						<Text>Logged in as </Text>
						{currentProfile ? (
							<Text colorScheme="purple">
								{currentProfile.handle}
							</Text>
						) : (
							<Text>loading...</Text>
						)}
					</VStack>
				</MenuItem>
				<MenuDivider />
				<MenuGroup title="Account">
					<MenuItem icon={<AiOutlineUser />}>
						<Link href="/settings">
							<Text>Profile</Text>
						</Link>
					</MenuItem>
					<MenuItem icon={<FiSettings />}>
						<Link href="/settings">
							<Text>Settings</Text>
						</Link>
					</MenuItem>
				</MenuGroup>
				<MenuDivider />
				<MenuGroup title="Switch Account">
					<VStack as="ul" maxHeight="300px" overflowY="scroll">
						{profiles
							? profiles.map((profile) => {
									return (
										<MenuItem
											onClick={() =>
												setCurrentProfile(profile)
											}
											as="li"
											key={profile.id}
										>
											<Image
												w={5}
												mr={3}
												borderRadius="full"
												src="https://bit.ly/dan-abramov"
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
