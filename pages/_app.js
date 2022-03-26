import "../styles/globals.css";
import React from "react";
import { ChakraProvider, useDisclosure } from "@chakra-ui/react";
import theme from "../theme";
import "@fontsource/nunito";
import Web3ContextProvider from "../context/Web3Context";
import ApolloContextProvider from "../context/ApolloContext";
import MetamaskInstalledModal from "../components/MetamaskInstalledModal";
import NetworkChangeModal from "../components/NetworkChangeModal";
import Header from "../components/Header";
import CreateProfileModal from "../components/CreateProfileModal";
import UploadModal from "../components/UploadModal";

export const RootContext = React.createContext(null);

function MyApp({ Component, pageProps }) {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const {
		isOpen: isUploadModalOpen,
		onOpen: uploadModalOnOpen,
		onClose: uploadModalOnClose,
	} = useDisclosure();
	const getLayout = Component.getLayout || ((page) => page);
	return (
		<ChakraProvider theme={theme}>
			<Web3ContextProvider>
				<ApolloContextProvider>
					<NetworkChangeModal />
					<MetamaskInstalledModal />
					<RootContext.Provider
						value={{
							isOpen,
							onOpen,
							onClose,
							isUploadModalOpen,
							uploadModalOnClose,
							uploadModalOnOpen,
						}}
					>
						<UploadModal />
						<CreateProfileModal />
						<Header />
					</RootContext.Provider>
					{getLayout(<Component {...pageProps} />)}
				</ApolloContextProvider>
			</Web3ContextProvider>
		</ChakraProvider>
	);
}

export default MyApp;
