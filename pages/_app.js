import "../styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../theme";
import "@fontsource/nunito";
import Web3ContextProvider from "../context/Web3Context";

function MyApp({ Component, pageProps }) {
	return (
		<ChakraProvider theme={theme}>
			<Web3ContextProvider>
				<Component {...pageProps} />
			</Web3ContextProvider>
		</ChakraProvider>
	);
}

export default MyApp;
