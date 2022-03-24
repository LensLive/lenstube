import "../styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../theme";
import "@fontsource/nunito";
import Web3ContextProvider from "../context/Web3Context";
import ApolloContextProvider from "../context/ApolloContext";
import MetamaskInstalledModal from "../components/MetamaskInstalledModal";
import NetworkChangeModal from "../components/NetworkChangeModal";
import Header from "../components/Header";

function MyApp({ Component, pageProps }) {
	const getLayout = Component.getLayout || ((page) => page);
	return (
		<ChakraProvider theme={theme}>
			<Web3ContextProvider>
				<ApolloContextProvider>
					<NetworkChangeModal />
					<MetamaskInstalledModal />
					<Header />
					{getLayout(<Component {...pageProps} />)}
				</ApolloContextProvider>
			</Web3ContextProvider>
		</ChakraProvider>
	);
}

export default MyApp;
