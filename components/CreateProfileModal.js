import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalBody,
	FormLabel,
	FormControl,
	Input,
	Button,
	VStack,
	Select,
} from "@chakra-ui/react";
import { useContext, useState, useEffect } from "react";
import { ApolloContext } from "../context/ApolloContext";
import { Web3Context } from "../context/Web3Context";
import { RootContext } from "../pages/_app";

function CreateProfileModal() {
	const { isOpen, onClose } = useContext(RootContext);
	const { account } = useContext(Web3Context);
	const {
		apolloContext,
		enabledModules: getEnabledModules,
		enabledCurrencies: getEnabledCurrencies,
		createProfile,
		pollUntilIndexed,
	} = useContext(ApolloContext);
	const { profiles } = apolloContext;
	const [enabledModules, setEnabledModules] = useState(null);
	const [selectedFollowModule, setSelectedFollowModule] = useState(null);
	const [enabledCurrencies, setEnabledCurrencies] = useState(null);
	const [feeValue, setFeeValue] = useState("");
	const [feeRecipient, setFeeRecipient] = useState("");
	const [selectedCurrency, setSelectedCurrency] = useState(null);
	const [handle, setHandle] = useState("");
	const [pfp, setPfp] = useState("");
	const [followPfp, setFollowPfp] = useState("");

	useEffect(() => {
		if (account !== null) {
			console.log(account);
			(async () => {
				let response2 = await getEnabledModules();
				setEnabledModules(response2.data.enabledModules);
			})();
		}
	}, [account]);

	useEffect(async () => {
		if (enabledModules) {
			let response = await getEnabledCurrencies();
			setEnabledCurrencies(response.data.enabledModuleCurrencies);
		}
	}, [enabledModules]);

	function handleChange(target, setter) {
		setter(target.value);
	}

	async function createProfileRequest() {
		let createProfileRequestObj = {
			handle,
			profilePictureUri: pfp,
			followNFTURI: followPfp,
			followModule:
				selectedFollowModule === "FeeFollowModule"
					? {
							feeFollowModule: {
								amount: {
									currency: selectedCurrency,
									value: feeValue,
								},
								recipient: feeRecipient,
							},
					  }
					: { freeFollowModule: true },
		};
		let response = await createProfile(createProfileRequestObj);
		onClose();
		alert("Refresh and connect again");
	}

	return (
		<Modal
			closeOnOverlayClick={profiles && profiles.length > 0}
			isOpen={
				account
					? profiles
						? profiles.length > 0
							? isOpen
							: true
						: false
					: false
			}
			onClose={onClose}>
			<ModalOverlay />
			<ModalContent alignItems='center'>
				<ModalHeader>Create Profile</ModalHeader>
				<ModalBody width='100%'>
					<VStack width='100%'>
						<FormControl width='100%'>
							<FormLabel htmlFor='handle'>Handle</FormLabel>
							<Input
								id='handle'
								value={handle}
								onChange={(e) =>
									handleChange(e.target, setHandle)
								}
								placeholder='handle'
							/>
						</FormControl>
						<FormControl width='100%'>
							<FormLabel htmlFor='pfp'>
								Profile Picture URI
							</FormLabel>
							<Input
								value={pfp}
								onChange={(e) => handleChange(e.target, setPfp)}
								id='pfp'
								placeholder='profile picture'
							/>
						</FormControl>
						<FormControl width='100%'>
							<FormLabel htmlFor='follow'>
								Follow NFT URI
							</FormLabel>
							<Input
								value={followPfp}
								onChange={(e) =>
									handleChange(e.target, setFollowPfp)
								}
								id='follow'
								placeholder='follow nft'
							/>
						</FormControl>
						<FormControl width='100%'>
							<FormLabel htmlFor='followModule'>
								Follow Module
							</FormLabel>
							{enabledModules !== null ? (
								<Select
									id='followModule'
									onChange={(e) =>
										handleChange(
											e.target,
											setSelectedFollowModule
										)
									}
									placeholder=' Select Follow Module'>
									<option value='FreeFollowModule'>
										FreeFollowModule
									</option>
									{enabledModules.followModules.map(
										(module) => {
											return (
												<option
													key={module.moduleName}
													value={module.moduleName}>
													{module.moduleName}
												</option>
											);
										}
									)}
								</Select>
							) : null}
						</FormControl>
						{selectedFollowModule == "FeeFollowModule" ? (
							<>
								<FormControl>
									<FormLabel htmlFor='currency'>
										{" "}
										Select Currency
									</FormLabel>
									{enabledCurrencies ? (
										<Select
											placeholder='Select Currency'
											id='currency'
											onChange={(e) =>
												handleChange(
													e.target,
													setSelectedCurrency
												)
											}>
											{enabledCurrencies.map(
												(currency) => {
													return (
														<option
															key={currency.name}
															value={
																currency.address
															}>
															{currency.name}
														</option>
													);
												}
											)}
										</Select>
									) : null}
								</FormControl>
								<FormControl>
									<FormLabel>Value</FormLabel>
									<Input
										value={feeValue}
										onChange={(e) =>
											handleChange(e.target, setFeeValue)
										}
										placeholder='value'
									/>
								</FormControl>
								<FormControl>
									<FormLabel>Recipient</FormLabel>
									<Input
										value={feeRecipient}
										onChange={(e) =>
											handleChange(
												e.target,
												setFeeRecipient
											)
										}
										placeholder='recipient'
									/>
								</FormControl>
							</>
						) : null}
					</VStack>
				</ModalBody>
				<ModalFooter>
					<Button onClick={createProfileRequest}>Create</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

export default CreateProfileModal;
