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
import { BiWorld, BiCopy, BiComment } from "react-icons/bi";
import { BsCollection } from "react-icons/bs";
import { useEffect, useContext, useState } from "react";
import { ApolloContext } from "../../context/ApolloContext";
import ConnectWallet from "../../components/ConnectWallet";
import { Web3Context } from "../../context/Web3Context";
import svgAvatarGenerator from "../../components/svgAvatarGenerator";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Profile() {
	const { account } = useContext(Web3Context);
	const {
		getPublications,
		getProfilesByProfileIds,
		apolloContext,
		doesFollow,
	} = useContext(ApolloContext);
	const { profiles, currentProfile } = apolloContext;
	const [profile, setProfile] = useState(null);
	const [posts, setPosts] = useState([]);
	const [mirrors, setMirrors] = useState([]);
	const [comments, setComments] = useState([]);
	const [viewerFollows, setViewerFollows] = useState(null);

	const router = useRouter();
	const { id } = router.query;

	useEffect(async () => {
		if (id) {
			let response = await getProfilesByProfileIds({ profileIds: [id] });
			console.log(response);
			let profile = response.data.profiles.items[0];
			setProfile(profile);
			let pubs = await getPublications({
				profileId: id,
				publicationTypes: ["POST", "COMMENT", "MIRROR"],
			});

			let publications = pubs.data.publications.items.filter((pub) => {
				return pub.appId == "lenstube";
			});
			console.log(publications);
			let posts = publications.filter((pub) => {
				return pub.__typename == "Post";
			});
			let mirrors = publications.filter((pub) => {
				return pub.__typename == "Mirror";
			});
			let comments = publications.filter((pub) => {
				return pub.__typename == "Comment";
			});

			setPosts(posts);
			setMirrors(mirrors);
			setComments(comments);
		}
	}, [id]);

	useEffect(() => {
		if (account !== null && profile != null) {
			(async () => {
				let followInfos = [
					{
						followerAddress: profile.ownedBy,
						profileId: profile.id,
					},
				];
				let doesFollowResponse = await doesFollow(followInfos);
				console.log(doesFollowResponse.data.doesFollow[0].follows);
				setViewerFollows(doesFollowResponse.data.doesFollow[0].follows);
			})();
		}
	}, [account, profile]);

	async function follow() {
		let followRequestInfo = {
			follow: [{ profile: id, followModule: null }],
		};

		let response = await createFollowTypedData(followRequestInfo);
		let typedData = response.data.createFollowTypedData.typedData;
		await followWithSig(typedData);
	}

	return (
		<Grid py='74px'>
			{profile != null ? (
				<VStack spacing={0}>
					<Box height='250px' overflow='hidden' width='100%'>
						<Image
							height='100%'
							width='100%'
							objectFit='cover'
							src={
								profile.coverPicture
									? profile.coverPicture.original.url
									: "https://f8n-production.imgix.net/creators/profile/k2t5e033k-img-0242-jpg-wunzsb.jpg?q=75&w=1600&auto=format%2Ccompress&fit=fill"
							}
						/>
					</Box>
					<Grid
						width='100%'
						padding={5}
						gridGap={5}
						templateColumns='1fr 4fr'>
						<VStack
							width='100%'
							alignItems='flex-start'
							position='relative'
							padding={5}
							maxHeight='1000px'
							style={{
								border: "1px solid var(--chakra-colors-gray-200)",
								padding: "20px",
								borderRadius: "5px",
								width: "100%",
							}}>
							{profile.picture ? (
								<Avatar
									size='2xl'
									position='absolute'
									top='-60px'
									outline='3px solid'
									outlineOffset={2}
									outlineColor='purple.400'
									src={profile.picture.original.url}
								/>
							) : (
								<Avatar
									backgroundColor='white'
									bg='transparent'
									size='2xl'
									position='absolute'
									top='-60px'
									outline='3px solid'
									outlineOffset={2}
									outlineColor='purple.400'
									src={svgAvatarGenerator(profile.id, {
										dataUri: true,
									})}
								/>
							)}
							<VStack
								pt='60px'
								alignItems='flex-start'
								width='100%'>
								<Tag
									size='40px'
									padding={0}
									borderRadius='20px'>
									<span style={{ margin: "4px 10px" }}>
										#{profile.id}
									</span>
									<Tag
										size='30px'
										borderRadius='20px'
										colorScheme='pink'
										height='100%'
										padding='4px 10px'>
										{`${profile.ownedBy.substr(
											0,
											5
										)}...${profile.ownedBy.substr(-5)}`}
									</Tag>
								</Tag>
								<Text fontSize='2xl' fontWeight='600'>
									{profile.name}
								</Text>
								<Text>@{profile.handle}</Text>
								<HStack spacing={5}>
									<VStack
										spacing={0}
										width='100%'
										alignItems='flex-start'>
										<span>
											{profile.stats.totalFollowing}
										</span>
										<span>Following</span>
									</VStack>
									<VStack
										width='100%'
										spacing={0}
										alignItems='flex-start'>
										<span>
											{profile.stats.totalFollowers}
										</span>
										<span>Followers</span>
									</VStack>
								</HStack>
								{profile.twitterUrl ? (
									<Tag>
										<FiTwitter />
										<span style={{ marginLeft: "5px" }}>
											{profile.twitterUrl.replace(
												"https://twitter.com/",
												""
											)}
										</span>
									</Tag>
								) : null}
								{profile.location ? (
									<Tag>
										<BiWorld />
										<span style={{ marginLeft: "5px" }}>
											{profile.location}
										</span>
									</Tag>
								) : null}
								{profile.website ? (
									<Tag>{profile.website}</Tag>
								) : null}
								{profile.bio ? (
									<VStack alignItems='flex-start'>
										<span>Bio</span>
										<p>{profile.bio}</p>
									</VStack>
								) : null}
								{account !== null &&
								profiles !== null &&
								currentProfile != null ? (
									profile.id == profiles[currentProfile].id ||
									viewerFollows ? null : (
										<Button onClick={follow}>Follow</Button>
									)
								) : null}
							</VStack>
						</VStack>
						<VStack
							style={{
								border: "1px solid var(--chakra-colors-gray-200)",
								padding: "20px",
								borderRadius: "5px",
								width: "100%",
							}}
							width='100%'>
							<Tabs
								width='100%'
								variant='soft-rounded'
								colorScheme='purple'>
								<TabList>
									<Tab>Posts</Tab>
									<Tab>Comments</Tab>
									<Tab>Mirrors</Tab>
								</TabList>
								<TabPanels>
									<TabPanel>
										{posts && posts.length > 0 ? (
											<Grid templateColumns='repeat(3, 1fr)'>
												{posts.map((post) => {
													return (
														<Link
															key={post.id}
															href={`/post/${post.id}`}>
															<VStack
																width='100%'
																border='1px solid var(--chakra-colors-gray-200)'
																borderRadius='10px'
																padding='20px'
																spacing={4}
																alignItems='flex-start'>
																<HStack
																	spacing={4}>
																	{post
																		.profile
																		.picture !==
																	null ? (
																		<Avatar
																			size='sm'
																			outline='3px solid'
																			outlineOffset={
																				2
																			}
																			outlineColor='purple.400'
																			src={
																				post
																					.profile
																					.picture
																					.original
																					.url
																			}
																		/>
																	) : (
																		<Avatar
																			backgroundColor='white'
																			bg='transparent'
																			size='sm'
																			outline='3px solid'
																			outlineOffset={
																				2
																			}
																			outlineColor='purple.400'
																			src={svgAvatarGenerator(
																				post
																					.profile
																					.id,
																				{
																					dataUri: true,
																				}
																			)}
																		/>
																	)}
																	<Text>
																		{
																			post
																				.profile
																				.name
																		}
																	</Text>
																</HStack>
																<HStack
																	justifyContent='flex-start'
																	width='100%'>
																	<Text>
																		{
																			post
																				.metadata
																				.name
																		}
																	</Text>
																</HStack>
																<video
																	style={{
																		maxWidth:
																			"100%",
																		borderRadius:
																			"10px",
																	}}
																	src={
																		post
																			.metadata
																			.media[0]
																			.original
																			.url
																	}
																/>
																<HStack
																	width='100%'
																	justifyContent='center'
																	spacing={5}>
																	<HStack
																		spacing={
																			2
																		}>
																		<BiComment />
																		<Text>
																			{
																				post
																					.stats
																					.totalAmountOfComments
																			}
																		</Text>
																	</HStack>
																	<HStack>
																		<BsCollection />
																		<Text>
																			{
																				post
																					.stats
																					.totalAmountOfCollects
																			}
																		</Text>
																	</HStack>
																	<HStack>
																		<BiCopy />
																		<Text>
																			{
																				post
																					.stats
																					.totalAmountOfMirrors
																			}
																		</Text>
																	</HStack>
																</HStack>
															</VStack>
														</Link>
													);
												})}
											</Grid>
										) : null}
									</TabPanel>

									<TabPanel>
										<VStack spacing={5} width='100%'>
											{posts && comments.length > 0
												? comments.map((comment) => {
														return (
															<VStack
																key={comment.id}
																alignItems='flex-start'
																border='1px solid var(--chakra-colors-gray-200)'
																padding={3}
																spacing={3}
																borderRadius='10px'
																width='100%'>
																<Link
																	href={`/post/${comment.mainPost.id}`}>
																	<Text
																		cursor='pointer'
																		fontWeight='600'>
																		{`Commented on ${comment.mainPost.profile.name}'s video`}
																	</Text>
																</Link>
																<HStack
																	spacing={5}>
																	{comment
																		.profile
																		.picture !==
																	null ? (
																		<Avatar
																			size='md'
																			outline='3px solid'
																			outlineOffset={
																				2
																			}
																			outlineColor='purple.400'
																			src={
																				comment
																					.profile
																					.picture
																					.original
																					.url
																			}
																		/>
																	) : (
																		<Avatar
																			backgroundColor='white'
																			bg='transparent'
																			size='md'
																			outline='3px solid'
																			outlineOffset={
																				2
																			}
																			outlineColor='purple.400'
																			src={svgAvatarGenerator(
																				comment
																					.profile
																					.id,
																				{
																					dataUri: true,
																				}
																			)}
																		/>
																	)}
																	<VStack
																		spacing={
																			0
																		}
																		alignItems='flex-start'>
																		<Text fontWeight='600'>
																			{
																				comment
																					.profile
																					.name
																			}
																		</Text>
																		<Text>
																			{
																				comment
																					.metadata
																					.content
																			}
																		</Text>
																	</VStack>
																</HStack>
																<HStack
																	width='100%'
																	justifyContent='center'
																	spacing={5}>
																	<HStack
																		spacing={
																			2
																		}>
																		<BiComment />
																		<Text>
																			{
																				comment
																					.stats
																					.totalAmountOfComments
																			}
																		</Text>
																	</HStack>
																	<HStack>
																		<BsCollection />
																		<Text>
																			{
																				comment
																					.stats
																					.totalAmountOfCollects
																			}
																		</Text>
																	</HStack>
																	<HStack>
																		<BiCopy />
																		<Text>
																			{
																				comment
																					.stats
																					.totalAmountOfMirrors
																			}
																		</Text>
																	</HStack>
																</HStack>
															</VStack>
														);
												  })
												: null}
										</VStack>
									</TabPanel>
									<TabPanel>
										{mirrors && mirrors.length > 0
											? mirrors.map((mirror) => {
													return (
														<span key={mirror.id}>
															{
																mirror.metadata
																	.name
															}
														</span>
													);
											  })
											: null}
									</TabPanel>
								</TabPanels>
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
