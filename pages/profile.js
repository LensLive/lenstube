import {
	Grid,
	VStack,
	Box,
	Image,
	HStack,
	Avatar,
	Text,
	Tabs,
	TabList,
	TabPanels,
	Tab,
	TabPanel,
	Button,
	Tag,
} from "@chakra-ui/react";
import { FiTwitter } from "react-icons/fi";
import { BiWorld } from "react-icons/bi";
import { useEffect, useContext } from "react";
import { ApolloContext } from "../context/ApolloContext";
import ConnectWallet from "../components/ConnectWallet";
import { Web3Context } from "../context/Web3Context";
import svgAvatarGenerator from "../components/svgAvatarGenerator";
export default function Profile() {
	const { account } = useContext(Web3Context);
	const { apolloContext, getPublications } = useContext(ApolloContext);
	const { currentProfile, profiles } = apolloContext;

	useEffect(async () => {
		console.log(profiles);
		console.log(apolloContext);
		if (currentProfile !== null && profiles !== undefined) {
			let pubs = await getPublications({
				profileId: profiles[currentProfile].id,
				publicationTypes: ["POST", "COMMENT", "MIRROR"],
			});
			console.log(pubs);
		}
	}, [currentProfile]);
	return (
		<Grid py="74px">
			{currentProfile !== undefined && profiles != null ? (
				<VStack spacing={0}>
					<Box height="250px" overflow="hidden" width="100%">
						<Image
							height="100%"
							width="100%"
							objectFit="cover"
							src={
								profiles[currentProfile].coverPicture
									? profiles[currentProfile].coverPicture
									: "https://f8n-production.imgix.net/creators/profile/k2t5e033k-img-0242-jpg-wunzsb.jpg?q=75&w=1600&auto=format%2Ccompress&fit=fill"
							}
						/>
					</Box>
					<Grid
						width="100%"
						padding={5}
						gridGap={5}
						templateColumns="1fr 4fr"
					>
						<VStack
							width="100%"
							alignItems="flex-start"
							position="relative"
							padding={5}
							style={{
								border: "1px solid var(--chakra-colors-gray-200)",
								padding: "20px",
								borderRadius: "5px",
								width: "100%",
							}}
						>
							{profiles[currentProfile].picture ? (
								<Avatar
									size="2xl"
									position="absolute"
									top="-60px"
									outline="3px solid"
									outlineOffset={2}
									outlineColor="purple.400"
									src={
										profiles[currentProfile].picture
											.original.url
									}
								/>
							) : (
								<Avatar
									backgroundColor="white"
									bg="transparent"
									size="2xl"
									position="absolute"
									top="-60px"
									outline="3px solid"
									outlineOffset={2}
									outlineColor="purple.400"
									src={svgAvatarGenerator(
										profiles[currentProfile].ownedBy,
										{
											dataUri: true,
										}
									)}
								/>
							)}
							<VStack
								pt="60px"
								alignItems="flex-start"
								width="100%"
							>
								<Tag
									size="40px"
									padding={0}
									borderRadius="20px"
								>
									<span style={{ margin: "4px 10px" }}>
										#{profiles[currentProfile].id}
									</span>
									<Tag
										size="30px"
										borderRadius="20px"
										colorScheme="pink"
										height="100%"
										padding="4px 10px"
									>
										{`${account.substr(
											0,
											5
										)}...${account.substr(-5)}`}
									</Tag>
								</Tag>
								<Text fontSize="2xl" fontWeight="600">
									{profiles[currentProfile].name}
								</Text>
								<Text>@{profiles[currentProfile].handle}</Text>
								<HStack spacing={5}>
									<VStack
										spacing={0}
										width="100%"
										alignItems="flex-start"
									>
										<span>
											{
												profiles[currentProfile].stats
													.totalFollowing
											}
										</span>
										<span>Following</span>
									</VStack>
									<VStack
										width="100%"
										spacing={0}
										alignItems="flex-start"
									>
										<span>
											{
												profiles[currentProfile].stats
													.totalFollowers
											}
										</span>
										<span>Followers</span>
									</VStack>
								</HStack>
								{profiles[currentProfile].twitterUrl ? (
									<Tag>
										<FiTwitter />
										<span style={{ marginLeft: "5px" }}>
											{profiles[
												currentProfile
											].twitterUrl.replace(
												"https://twitter.com/",
												""
											)}
										</span>
									</Tag>
								) : null}
								{profiles[currentProfile].location ? (
									<Tag>
										<BiWorld />
										<span style={{ marginLeft: "5px" }}>
											{profiles[currentProfile].location}
										</span>
									</Tag>
								) : null}
								{profiles[currentProfile].website ? (
									<Tag>
										{profiles[currentProfile].website}
									</Tag>
								) : null}
								{profiles[currentProfile].bio ? (
									<VStack alignItems="flex-start">
										<span>Bio</span>
										<p>{profiles[currentProfile].bio}</p>
									</VStack>
								) : null}
								<Button>Follow</Button>
							</VStack>
						</VStack>
						<VStack
							style={{
								border: "1px solid var(--chakra-colors-gray-200)",
								padding: "20px",
								borderRadius: "5px",
								width: "100%",
							}}
							width="100%"
						>
							<Tabs
								width="100%"
								variant="soft-rounded"
								colorScheme="purple"
							>
								<TabList>
									<Tab>Posts</Tab>
									<Tab>Comments</Tab>
									<Tab>Mirrors</Tab>
								</TabList>
							</Tabs>
						</VStack>
					</Grid>
				</VStack>
			) : (
				<ConnectWallet />
			)}
		</Grid>
	);
}
