import {
	VStack,
	HStack,
	InputGroup,
	Input,
	Button,
	FormControl,
	FormLabel,
	Grid,
	InputLeftAddon,
	Textarea,
	Text,
	Box,
	Image,
} from "@chakra-ui/react";
import Link from "next/link";
import { useContext } from "react";
import { ApolloContext } from "../../context/ApolloContext";
import ConnectWallet from "../../components/ConnectWallet";
import { useState, useEffect, useReducer } from "react";
import SettingsLayout from "../../components/SettingsLayout";

const profileReducer = (state, action) => {
	switch (action.type) {
		case "ID":
			return { ...state, profileId: action.payload };
		case "NAME":
			return { ...state, name: action.payload };
		case "LOCATION":
			return { ...state, location: action.payload };
		case "WEBSITE":
			return { ...state, website: action.payload };
		case "TWITTER":
			return { ...state, twitterUrl: action.payload };
		case "BIO":
			return { ...state, bio: action.payload };
		case "COVER":
			return { ...state, coverPicture: action.payload };
		case "SET_PROFILE":
			return { ...state, ...action.payload };
		default:
			return state;
	}
};

export default function Settings() {
	const {
		apolloContext,
		dispatch: apolloDispatch,
		updateProfile,
		getNfts,
		updateProfilePictureUri,
	} = useContext(ApolloContext);
	const { profiles, currentProfile, nfts } = apolloContext;
	const [updateProfileRequest, dispatch] = useReducer(profileReducer, {});
	const [selectedNft, setSelectedNft] = useState(0);

	useEffect(() => {
		if (currentProfile !== undefined) {
			dispatch({
				type: "SET_PROFILE",
				payload: {
					id: profiles[currentProfile].id,
					name: profiles[currentProfile].name,
					handle: profiles[currentProfile].handle,
					bio: profiles[currentProfile].bio,
					location: profiles[currentProfile].location,
					website: profiles[currentProfile].website,
					twitterUrl: profiles[currentProfile].twitterUrl
						? profiles[currentProfile].twitterUrl.replace(
								"https://twitter.com/",
								""
						  )
						: profiles[currentProfile].twitterUrl,
					coverPicture: profiles[currentProfile].coverPicture,
				},
			});
			getNfts();
		}
	}, [currentProfile]);

	function handleInputChange(type, payload) {
		dispatch({ type, payload });
	}

	return (
		<>
			<form
				style={{
					border: "1px solid var(--chakra-colors-gray-100)",
					padding: "20px",
					borderRadius: "5px",
					width: "100%",
				}}
			>
				<VStack spacing={4} alignItems="flex-start" width="100%">
					<FormControl>
						<FormLabel>Handle</FormLabel>
						<Input
							disabled
							_disabled={{
								background: "gray.100",
								color: "gray.800",
							}}
							placeholder={updateProfileRequest.handle}
						/>
					</FormControl>
					<FormControl>
						<FormLabel>Profile Id</FormLabel>
						<Input
							disabled
							_disabled={{
								background: "gray.100",
								color: "gray.800",
							}}
							placeholder={updateProfileRequest.id}
						/>
					</FormControl>
					<FormControl>
						<FormLabel>Name</FormLabel>
						<Input
							value={
								updateProfileRequest.name
									? updateProfileRequest.name
									: ""
							}
							placeholder="Light Yagami"
							onChange={({ target }) =>
								handleInputChange("NAME", target.value)
							}
						/>
					</FormControl>
					<FormControl>
						<FormLabel>Location</FormLabel>
						<Input
							value={
								updateProfileRequest.location
									? updateProfileRequest.location
									: ""
							}
							placeholder="Metaverse"
							onChange={({ target }) =>
								handleInputChange("LOCATION", target.value)
							}
						/>
					</FormControl>
					<FormControl>
						<FormLabel>Website</FormLabel>
						<InputGroup>
							<Input
								placeholder="https://lenslive.com"
								value={
									updateProfileRequest.website
										? updateProfileRequest.website
										: ""
								}
								onChange={({ target }) =>
									handleInputChange("WEBSITE", target.value)
								}
							/>
						</InputGroup>
					</FormControl>
					<FormControl>
						<FormLabel>Twitter Url</FormLabel>
						<InputGroup>
							<InputLeftAddon>https://twitter.com</InputLeftAddon>
							<Input
								placeholder="lenslive"
								value={
									updateProfileRequest.twitterUrl
										? updateProfileRequest.twitterUrl
										: ""
								}
								onChange={({ target }) =>
									handleInputChange("TWITTER", target.value)
								}
							/>
						</InputGroup>
					</FormControl>
					<FormControl>
						<FormLabel>Bio</FormLabel>
						<Textarea
							value={
								updateProfileRequest.bio
									? updateProfileRequest.bio
									: ""
							}
							placeholder="Tell us something about yourself!"
							onChange={({ target }) =>
								handleInputChange("BIO", target.value)
							}
						></Textarea>
					</FormControl>
					<FormControl>
						<FormLabel>Cover Picture</FormLabel>
						<Input type="file" />
					</FormControl>
					<Button
						onClick={async () => {
							let newProfile = await updateProfile({
								profileId: updateProfileRequest.id,
								name: updateProfileRequest.name,
								bio: updateProfileRequest.bio,
								location: updateProfileRequest.location,
								website: updateProfileRequest.website,
								twitterUrl: `https://twitter.com/${updateProfileRequest.twitterUrl}`,
								coverPicture: updateProfileRequest.coverPicture,
							});
							apolloDispatch({
								type: "SET_PROFILE",
								payload: newProfile.data.updateProfile,
							});
						}}
					>
						Save
					</Button>
				</VStack>
			</form>

			{nfts ? (
				<form
					style={{
						border: "1px solid var(--chakra-colors-gray-100)",
						padding: "20px",
						borderRadius: "5px",
						width: "100%",
					}}
				>
					<Text>Profile Picture</Text>
					<Grid templateColumns="repeat(4, 1fr)">
						{nfts.map((nft, index) => {
							return (
								<Box
									borderRadius="10px"
									overflow="hidden"
									w="150px"
									h="150px"
									boxSizing="content-box"
									border={
										selectedNft === index
											? "2px solid"
											: null
									}
									padding={selectedNft === index ? "1px" : 0}
									borderColor="purple.500"
									onClick={() => setSelectedNft(index)}
									key={`${nft.contractAddress}${nft.tokenId}`}
								>
									<Image
										borderRadius="10px"
										w="150px"
										h="150px"
										src={nft.contentURI}
										alt={nft.name}
									/>
								</Box>
							);
						})}
					</Grid>

					<Button
						onClick={() =>
							updateProfilePictureUri(
								updateProfileRequest.id,
								selectedNft
							)
						}
						mt={4}
					>
						Save
					</Button>
				</form>
			) : null}
		</>
	);
}

Settings.getLayout = function getLayout(page) {
	return <SettingsLayout>{page}</SettingsLayout>;
};
