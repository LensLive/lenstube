import SettingsLayout from "../../components/SettingsLayout";
import { HStack, Button, VStack, Select } from "@chakra-ui/react";
import { ApolloContext } from "../../context/ApolloContext";
import { useEffect, useContext, useState } from "react";
import { Web3Context } from "../../context/Web3Context";

export default function Allowance() {
	const {
		enabledCurrencies: getEnabledCurrencies,
		enabledModules: getEnabledModules,
		getModuleApprovalData,
		allowance,
	} = useContext(ApolloContext);
	const { wallet } = useContext(Web3Context);
	const [enabledModules, setEnabledModules] = useState(null);
	const [enabledCurrencies, setEnabledCurrencies] = useState(null);
	const [selectedCurrency, setSelectedCurrency] = useState(null);
	const [allowanceData, setAllowanceData] = useState(null);
	useEffect(() => {
		(async () => {
			let response = await getEnabledCurrencies();
			let response2 = await getEnabledModules();
			setEnabledModules(response2.data.enabledModules);
			setEnabledCurrencies(response.data.enabledModuleCurrencies);
		})();
	}, []);

	useEffect(() => {
		if (selectedCurrency !== null) {
			(async () => {
				let response = await allowance({
					currencies: [selectedCurrency],
					collectModules: [
						"LimitedFeeCollectModule",
						"FeeCollectModule",
						"LimitedTimedFeeCollectModule",
						"TimedFeeCollectModule",
						"EmptyCollectModule",
						"RevertCollectModule",
					],
					followModules: ["FeeFollowModule"],
					referenceModules: ["FollowerOnlyReferenceModule"],
				});
				let allowanceData = {};
				response.data.approvedModuleAllowanceAmount.map((module) => {
					allowanceData[module.module] = parseInt(module.allowance);
				});
				console.log(allowanceData);
				setAllowanceData(allowanceData);
			})();
		}
	}, [selectedCurrency]);

	async function generateApprovalModuleData(moduleType, module, value) {
		let data = {
			currency: selectedCurrency,
			value: value.toString(),
		};
		data[moduleType] = module;

		console.log(data);

		let response = await getModuleApprovalData(data);
		let signer = await wallet.getSigner();
		let { generateModuleCurrencyApprovalData } = response.data;
		await signer.sendTransaction({
			to: generateModuleCurrencyApprovalData.to,
			from: generateModuleCurrencyApprovalData.from,
			data: generateModuleCurrencyApprovalData.data,
		});
	}

	return (
		<>
			<h1 style={{ alignSelf: "flex-start" }}>Allowances</h1>
			<form
				style={{
					border: "1px solid var(--chakra-colors-gray-100)",
					padding: "20px",
					borderRadius: "5px",
					width: "100%",
				}}
			>
				<VStack spacing={2}>
					<VStack spacing={2} width="100%" alignItems="flex-start">
						<h1>Currencies</h1>
						{enabledCurrencies !== null ? (
							<Select
								onChange={(e) =>
									setSelectedCurrency(e.target.value)
								}
								placeholder="Select Currency"
							>
								{enabledCurrencies.map((currency) => {
									return (
										<option
											key={currency.name}
											value={currency.address}
										>
											{currency.name} ({currency.symbol})
										</option>
									);
								})}
							</Select>
						) : null}
					</VStack>
					{allowanceData !== null ? (
						<>
							<h1 style={{ alignSelf: "flex-start" }}>Modules</h1>
							<VStack
								style={{
									border: "1px solid var(--chakra-colors-gray-100)",
									padding: "20px",
									borderRadius: "5px",
									width: "100%",
								}}
								spacing={3}
								alignItems="flex-start"
							>
								<h2>Follow Modules</h2>
								{enabledModules !== null
									? enabledModules.followModules.map(
											(module) => {
												return (
													<HStack
														width="100%"
														justifyContent="space-between"
														key={module.moduleName}
													>
														<h2>
															{module.moduleName}
														</h2>
														{allowanceData[
															module.moduleName
														] ? (
															<Button
																onClick={() =>
																	generateApprovalModuleData(
																		"followModule",
																		module.moduleName,
																		0
																	)
																}
																variant="ghost"
															>
																Disallow
															</Button>
														) : (
															<Button
																onClick={() =>
																	generateApprovalModuleData(
																		"followModule",
																		module.moduleName,
																		10
																	)
																}
															>
																Allow
															</Button>
														)}
													</HStack>
												);
											}
									  )
									: null}
							</VStack>
							<VStack
								style={{
									border: "1px solid var(--chakra-colors-gray-100)",
									padding: "20px",
									borderRadius: "5px",
									width: "100%",
								}}
								spacing={3}
								alignItems="flex-start"
							>
								<h2>Collect Modules</h2>
								{enabledModules !== null
									? enabledModules.collectModules.map(
											(module) => {
												return (
													<HStack
														width="100%"
														justifyContent="space-between"
														key={module.moduleName}
													>
														<h2>
															{module.moduleName}
														</h2>
														{allowanceData[
															module.moduleName
														] ? (
															<Button
																onClick={() =>
																	generateApprovalModuleData(
																		"collectModule",
																		module.moduleName,
																		0
																	)
																}
																variant="ghost"
															>
																Disallow
															</Button>
														) : (
															<Button
																onClick={() =>
																	generateApprovalModuleData(
																		"collectModule",
																		module.moduleName,
																		10
																	)
																}
															>
																Allow
															</Button>
														)}
													</HStack>
												);
											}
									  )
									: null}
							</VStack>
							<VStack
								style={{
									border: "1px solid var(--chakra-colors-gray-100)",
									padding: "20px",
									borderRadius: "5px",
									width: "100%",
								}}
								spacing={3}
								alignItems="flex-start"
							>
								<h2>Reference Modules</h2>
								{enabledModules !== null
									? enabledModules.referenceModules.map(
											(module) => {
												return (
													<HStack
														width="100%"
														justifyContent="space-between"
														key={module.moduleName}
													>
														<h2>
															{module.moduleName}
														</h2>
														{allowanceData[
															module.moduleName
														] ? (
															<Button
																onClick={() =>
																	generateApprovalModuleData(
																		"referenceModule",
																		module.moduleName,
																		0
																	)
																}
																variant="ghost"
															>
																Disallow
															</Button>
														) : (
															<Button
																onClick={() =>
																	generateApprovalModuleData(
																		"referenceModule",
																		module.moduleName,
																		10
																	)
																}
															>
																Allow
															</Button>
														)}
													</HStack>
												);
											}
									  )
									: null}
							</VStack>
						</>
					) : null}
				</VStack>
			</form>
		</>
	);
}

Allowance.getLayout = function getLayout(page) {
	return <SettingsLayout>{page}</SettingsLayout>;
};
