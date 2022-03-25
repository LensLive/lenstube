import { HStack, Grid, VStack, Button } from "@chakra-ui/react";
import { ApolloContext } from "../context/ApolloContext";
import { useContext } from "react";
import ConnectWallet from "./ConnectWallet";
import { useEffect } from "react";
import Link from "next/link";

export default function SettingsLayout({ children }) {
	const { apolloContext } = useContext(ApolloContext);
	const { currentProfile } = apolloContext;

	return (
		<HStack justifyContent="center" width="100%" py="100px">
			{currentProfile !== undefined ? (
				<Grid
					width="100%"
					templateColumns="1fr 3fr"
					gridGap={4}
					px="200px"
				>
					<VStack width="100%">
						<Link href="/settings">
							<Button
								variant="ghost"
								textAlign="left"
								width="100%"
							>
								General
							</Button>
						</Link>
						<Link href="/settings/allowance">
							<Button
								variant="ghost"
								textAlign="left"
								width="100%"
							>
								Allowance
							</Button>
						</Link>
					</VStack>
					<VStack spacing="20px" width="100%">
						{children}
					</VStack>
				</Grid>
			) : (
				<ConnectWallet />
			)}
		</HStack>
	);
}
