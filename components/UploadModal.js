import { create } from "ipfs-http-client";
import { v4 as uuidv4 } from "uuid";
import { useContext, useState } from "react";
import { RootContext } from "../pages/_app";
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	FormControl,
	FormLabel,
	Input,
	Button,
	VStack,
	Textarea,
} from "@chakra-ui/react";
import axios from "axios";
import { ApolloContext } from "../context/ApolloContext";
import { Web3Context } from "../context/Web3Context";
import { utils, ethers } from "ethers";
import omitDeep from "omit-deep";
import { LENS_HUB_ABI } from "../abi";

const client = create({
	host: "ipfs.infura.io",
	port: 5001,
	protocol: "https",
});

const splitSignature = (signature) => {
	return utils.splitSignature(signature);
};
function UploadModal() {
	const { createPostTypedData, apolloContext } = useContext(ApolloContext);
	const { wallet } = useContext(Web3Context);
	const { profiles, currentProfile } = apolloContext;
	const { isUploadModalOpen, uploadModalOnClose } = useContext(RootContext);
	const [videoTitle, setVideoTitle] = useState("");
	const [videoFile, setVideoFile] = useState("");
	const [videoFileName, setVideoFileName] = useState("");
	const [videoUploading, setVideoUploading] = useState(false);
	const [description, setDescription] = useState("");

	async function signedTypeData(domain, types, value) {
		const signer = await wallet.getSigner();
		return signer._signTypedData(
			omitDeep(domain, "__typename"),
			omitDeep(types, "__typename"),
			omitDeep(value, "__typename")
		);
	}

	function handleFileChange(target, setter) {
		setVideoFileName(target.files[0].name);
		setter(target.files[0]);
	}

	async function handleFileUpload() {
		setVideoUploading(true);

		const reader = new window.FileReader();
		reader.readAsArrayBuffer(videoFile);
		reader.onloadend = async () => {
			let videoData = Buffer.from(reader.result);
			console.log(videoData);
			let instance = axios.create({
				baseURL: "https://livepeer.com/api/",
				headers: {
					Authorization: `Bearer ${process.env.NEXT_PUBLIC_LIVEPEER_TOKEN}`,
				},
			});

			let response = await instance.post("asset/request-upload", {
				name: videoTitle,
			});
			let assetId = response.data.asset.id;
			let uploadResponse = await axios({
				method: "put",
				url: response.data.url,
				data: videoData,
				headers: { "Content-Type": "video/mp4" },
			});

			while (true) {
				let taskResponse = await instance.get(
					"https://livepeer.com/api/task"
				);

				if (taskResponse.data[0].status.phase == "completed") {
					break;
				}
				console.log(taskResponse);
				await new Promise((resolve) => setTimeout(resolve, 5000));
			}

			let ipfsExportResponse = await instance.post(
				`/asset/${assetId}/export`,
				{
					ipfs: {},
				}
			);

			while (true) {
				let taskResponse = await instance.get(
					"https://livepeer.com/api/task"
				);

				if (taskResponse.data[0].status.phase == "completed") {
					console.log(
						taskResponse.data[0].output.export.ipfs
							.videoFileGatewayUrl
					);

					try {
						let pubMetadata = {
							version: "1.0.0",
							metadata_id: uuidv4(),
							description,
							external_url:
								taskResponse.data[0].output.export.ipfs
									.videoFileGatewayUrl,
							name: videoTitle,
							attributes: [
								{
									displayType: "string",
									traitType: "Title",
									value: videoTitle,
								},
							],
							media: [
								{
									item: taskResponse.data[0].output.export
										.ipfs.videoFileGatewayUrl,
									type: "video/mp4",
								},
							],
							animation_url:
								taskResponse.data[0].output.export.ipfs
									.videoFileUrl,
							appId: "lenslive",
						};
						let ipfsResult = await client.add(
							JSON.stringify(pubMetadata)
						);
						console.log(ipfsResult);

						const createPostRequest = {
							profileId: profiles[currentProfile].id,
							contentURI: `ipfs://${ipfsResult.path}`,
							collectModule: {
								emptyCollectModule: true,
							},
							referenceModule: {
								followerOnlyReferenceModule: false,
							},
						};

						const result = await createPostTypedData(
							createPostRequest
						);

						const typedData =
							result.data.createPostTypedData.typedData;

						const signature = await signedTypeData(
							typedData.domain,
							typedData.types,
							typedData.value
						);

						console.log("create post: signature", signature);

						const { v, r, s } = splitSignature(signature);
						const signer = await wallet.getSigner();
						const lensHub = new ethers.Contract(
							"0xd7B3481De00995046C7850bCe9a5196B7605c367",
							LENS_HUB_ABI,
							signer
						);

						const tx = await lensHub.postWithSig({
							profileId: typedData.value.profileId,
							contentURI: typedData.value.contentURI,
							collectModule: typedData.value.collectModule,
							collectModuleData:
								typedData.value.collectModuleData,
							referenceModule: typedData.value.referenceModule,
							referenceModuleData:
								typedData.value.referenceModuleData,
							sig: {
								v,
								r,
								s,
								deadline: typedData.value.deadline,
							},
						});
						console.log("create post: tx hash", tx.hash);
					} catch (error) {
						console.log(error);
					} finally {
						break;
					}
				}
				console.log(taskResponse);
				await new Promise((resolve) => setTimeout(resolve, 5000));
			}

			setVideoUploading(false);
		};
	}

	function handleChange(target, setter) {
		setter(target.value);
	}

	return (
		<Modal isOpen={isUploadModalOpen} onClose={uploadModalOnClose}>
			<ModalOverlay />
			<ModalContent alignItems="center">
				<ModalHeader>Upload Video</ModalHeader>
				<ModalBody width="100%">
					<VStack spacing={4}>
						<FormControl>
							<FormLabel htmlFor="title">Video Title</FormLabel>
							<Input
								value={videoTitle}
								onChange={(e) =>
									handleChange(e.target, setVideoTitle)
								}
								id="title"
								placeholder="Video Title"
							/>
						</FormControl>
						<FormControl>
							<FormLabel htmlFor="description">
								Video Title
							</FormLabel>
							<Textarea
								value={description}
								onChange={(e) =>
									handleChange(e.target, setDescription)
								}
								id="description"
								placeholder="Video Description"
							/>
						</FormControl>
						<FormControl>
							<span>
								{videoFileName == ""
									? "No File Selected"
									: videoFileName}
							</span>
							<FormLabel
								background="purple.400"
								rounded="md"
								color="white"
								padding={2}
								textAlign="center"
								htmlFor="file"
							>
								Upload File
							</FormLabel>
							<Input
								onChange={(e) =>
									handleFileChange(e.target, setVideoFile)
								}
								display="none"
								id="file"
								type="file"
								accept="video/mp4"
							/>
						</FormControl>
						<Button
							onClick={handleFileUpload}
							isLoading={videoUploading}
						>
							Upload
						</Button>
					</VStack>
				</ModalBody>
				<ModalFooter></ModalFooter>
			</ModalContent>
		</Modal>
	);
}

export default UploadModal;
