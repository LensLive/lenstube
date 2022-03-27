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
	Avatar,
} from "@chakra-ui/react";
import { FiSettings } from "react-icons/fi";
import { AiOutlineUser } from "react-icons/ai";
import { ApolloContext } from "../context/ApolloContext";
import { useContext } from "react";
import Link from "next/link";
import svgAvatarGenerator from "./svgAvatarGenerator";
import { RootContext } from "../pages/_app";

export function ProfileMenu() {
	const { apolloContext, dispatch: apolloDispatch } =
		useContext(ApolloContext);
	const { onOpen } = useContext(RootContext);
	const { profiles, currentProfile } = apolloContext;

	return (
		<Menu>
			{profiles && profiles.length > 0 && currentProfile !== undefined ? (
				<MenuButton
					as={Button}
					borderRadius="full"
					w="10px"
					overflow="hidden"
					padding={0}
				>
					{profiles[currentProfile].picture ? (
						<Avatar
							src={profiles[currentProfile].picture.original.url}
						/>
					) : (
						<Avatar
							backgroundColor="white"
							size="md"
							bg="transparent"
							src={svgAvatarGenerator(
								profiles[currentProfile].id,
								{
									dataUri: true,
								}
							)}
						/>
					)}
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
						{profiles &&
						profiles.length > 0 &&
						currentProfile !== undefined ? (
							<Text colorScheme="purple">
								{profiles[currentProfile].name}
							</Text>
						) : (
							<Text>loading...</Text>
						)}
					</VStack>
				</MenuItem>
				<MenuDivider />
				{profiles &&
				profiles.length > 0 &&
				currentProfile !== undefined ? (
					<MenuGroup title="Account">
						<Link href={`/user/${profiles[currentProfile].id}`}>
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
				) : null}
				<MenuDivider />
				<MenuGroup title="Switch Account">
					<VStack as="ul" maxHeight="300px" overflowY="scroll">
						{profiles && profiles.length > 0
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
											{profile.picture ? (
												<Avatar
													src={
														profile.picture.original
															.url
													}
												/>
											) : (
												<Avatar
													backgroundColor="white"
													size="md"
													bg="transparent"
													src={svgAvatarGenerator(
														profile.id,
														{
															dataUri: true,
														}
													)}
												/>
											)}
											<span>{profile.handle}</span>
										</MenuItem>
									);
							  })
							: null}
					</VStack>
				</MenuGroup>
				<MenuDivider />
				<MenuGroup>
					<VStack padding={1}>
						<Button onClick={onOpen} width="100%">
							Create Profile
						</Button>
					</VStack>
				</MenuGroup>
			</MenuList>
		</Menu>
	);
}
