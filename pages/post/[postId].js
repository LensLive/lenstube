import {
	Grid,
	VStack,
	HStack,
	FormControl,
	FormLabel,
	Textarea,
	Button,
	Text,
	Heading,
	Avatar,
} from "@chakra-ui/react";
import { ApolloContext } from "../../context/ApolloContext";
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import { BiComment, BiCopy } from "react-icons/bi";
import { BsCollection } from "react-icons/bs";
import { v4 as uuidv4 } from "uuid";
import { Web3Context } from "../../context/Web3Context";
import { create } from "ipfs-http-client";
import svgAvatarGenerator from "../../components/svgAvatarGenerator";
import Link from "next/link";

const client = create({
	host: "ipfs.infura.io",
	port: 5001,
	protocol: "https",
});

function Video() {
	const { account } = useContext(Web3Context);
	const {
		explorePublications,
		getPublication,
		createCommentTypedData,
		apolloContext,
		commentWithSig,
		followWithSig,
		createFollowTypedData,
		doesFollow,
		hasCollected,
		createCollectTypedData,
		collectWithSig,
	} = useContext(ApolloContext);

	const { profiles, currentProfile } = apolloContext;
	const [video, setVideo] = useState(null);
	const [videos, setVideos] = useState([]);
	const [comment, setComment] = useState("");
	const [comments, setComments] = useState([]);
	const [viewerFollows, setViewerFollows] = useState(null);
	const [hasCollectedPub, setHasCollectedPub] = useState(null);
	const router = useRouter();
	const { postId } = router.query;

	useEffect(() => {
		if (postId !== undefined) {
			(async () => {
				let publication = await getPublication(postId);
				let publications = await explorePublications();

				let postPublications =
					publications.data.explorePublications.items.filter(
						(post) => {
							return post.__typename == "Post";
						}
					);
				let commentPublications =
					publications.data.explorePublications.items.filter(
						(publication) => {
							return (
								publication.__typename == "Comment" &&
								publication.mainPost.id == postId
							);
						}
					);
				console.log(postPublications);
				setComments(commentPublications);
				setVideo(publication.data.publication);
				setVideos(postPublications);
			})();
		}
	}, [postId]);

	useEffect(() => {
		if (account !== null && video !== null) {
			(async () => {
				let followInfos = [
					{
						followerAddress: video.profile.ownedBy,
						profileId: video.profile.id,
					},
				];
				let doesFollowResponse = await doesFollow(followInfos);
				let collectedRequest = {
					collectRequests: [
						{ walletAddress: account, publicationIds: video.id },
					],
				};
				let hasCollectedResponse = await hasCollected(collectedRequest);
				setViewerFollows(doesFollowResponse.data.doesFollow[0].follows);
				// console.log(hasCollectedResponse.data.hasCollected[0].results[0].collected);
				setHasCollectedPub(
					hasCollectedResponse.data.hasCollected[0].results[0]
						.collected
				);
			})();
		}
	}, [account, video]);

	async function createCommentData() {
		let commentMetdata = {
			version: "1.0.0",
			metadata_id: uuidv4(),
			description: `Comment on ${postId}`,
			content: comment,
			name: "Comment",
			appId: "lenstube",
		};
		let ipfsResult = await client.add(JSON.stringify(commentMetdata));

		let typedData = await createCommentTypedData({
			profileId: profiles[currentProfile].id,
			publicationId: postId,
			contentURI: `ipfs://${ipfsResult.path}`,
			collectModule: {
				emptyCollectModule: true,
			},
			referenceModule: {
				followerOnlyReferenceModule: false,
			},
		});

		await commentWithSig(typedData.data.createCommentTypedData.typedData);
	}

	async function follow() {
		let followRequestInfo = {
			follow: [{ profile: video.profile.id, followModule: null }],
		};

		let response = await createFollowTypedData(followRequestInfo);
		let typedData = response.data.createFollowTypedData.typedData;
		await followWithSig(typedData);
	}

	async function collect() {
		let collectTypedDataRequest = {
			publicationId: video.id,
		};
		let response = await createCollectTypedData(collectTypedDataRequest);
		let typedData = response.data.createCollectTypedData.typedData;
		await collectWithSig(typedData);
	}

	return (
		<Grid gridGap="50px" templateColumns="4fr 2fr" padding={5} py="100px">
			{video !== null ? (
				<VStack alignItems="flex-start" spacing={4}>
					<video
						src={video.metadata.media[0].original.url}
						autoPlay={true}
						width="100%"
						controls={true}
					/>
					<HStack width="100%" justifyContent="space-between">
						<VStack alignItems="flex-start">
							<Heading size="lg">{video.metadata.name}</Heading>
							<Heading size="md">{video.profile.name}</Heading>
						</VStack>
						{account !== null ? (
							<HStack>
								{hasCollectedPub !== null &&
								!hasCollectedPub ? (
									<Button variant="ghost" onClick={collect}>
										Collect
									</Button>
								) : null}
								{viewerFollows !== null && !viewerFollows ? (
									<Button onClick={follow}>Follow</Button>
								) : null}
							</HStack>
						) : null}
					</HStack>
					<VStack width="100%" spacing={5} alignItems="flex-start">
						<Heading size="md">Comments</Heading>
						{account !== null ? (
							<>
								<FormControl>
									<FormLabel>Comment</FormLabel>
									<Textarea
										value={comment}
										onChange={(e) =>
											setComment(e.target.value)
										}
										placeholder="Comment"
									/>
								</FormControl>
								<Button onClick={createCommentData}>
									Comment
								</Button>
							</>
						) : null}

						{comments !== null ? (
							<VStack alignItems="flex-start" spacing={5}>
								{comments.length > 0
									? comments.map((comment) => {
											return (
												<HStack
													spacing={5}
													alignItems="flex-start"
													key={comment.id}
												>
													{comment.profile.picture !==
													null ? (
														<Avatar
															size="md"
															outline="3px solid"
															outlineOffset={2}
															outlineColor="purple.400"
															src={
																comment.profile
																	.picture
																	.original
																	.url
															}
														/>
													) : (
														<Avatar
															backgroundColor="white"
															bg="transparent"
															size="md"
															outline="3px solid"
															outlineOffset={2}
															outlineColor="purple.400"
															src={svgAvatarGenerator(
																comment.profile
																	.id,
																{
																	dataUri: true,
																}
															)}
														/>
													)}
													<VStack
														spacing={0}
														alignItems="flex-start"
													>
														<Text fontWeight="600">
															{
																comment.profile
																	.name
															}
														</Text>
														<Text>
															{
																comment.metadata
																	.content
															}
														</Text>
													</VStack>
												</HStack>
											);
									  })
									: null}
							</VStack>
						) : null}
					</VStack>
				</VStack>
			) : null}
			<VStack alignItems="flex-start" justifyContent="flex-start">
				<Text alignSelf="flex-start">You Might Also Like...</Text>
				{videos !== null && videos.length > 0
					? videos.map((videoObj) => {
							return (
								<HStack key={videoObj.id}>
									<Link href={`/post/${videoObj.id}`}>
										<video
											width="220px"
											src={
												videoObj.metadata.media[0]
													.original.url
											}
										/>
									</Link>
									<VStack
										justifyContent="flex-start"
										alignItems="flex-start"
										width="100%"
										height="100%"
									>
										<Text>{videoObj.metadata.name}</Text>
										<Text fontWeight="600">
											{videoObj.profile.name}
										</Text>
										<HStack
											width="100%"
											justifyContent="center"
											spacing={5}
										>
											<HStack spacing={2}>
												<BiComment />
												<Text>
													{
														videoObj.stats
															.totalAmountOfComments
													}
												</Text>
											</HStack>
											<HStack>
												<BsCollection />
												<Text>
													{
														videoObj.stats
															.totalAmountOfCollects
													}
												</Text>
											</HStack>
											<HStack>
												<BiCopy />
												<Text>
													{
														videoObj.stats
															.totalAmountOfMirrors
													}
												</Text>
											</HStack>
										</HStack>
									</VStack>
								</HStack>
							);
					  })
					: null}
			</VStack>
		</Grid>
	);
}

export default Video;
