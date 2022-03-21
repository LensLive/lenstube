import {
	extendTheme,
	withDefaultColorScheme,
	ThemeConfig,
} from "@chakra-ui/react";
import Input from "./Input";

const theme = extendTheme(
	{
		fonts: {
			heading: "Nunito",
			body: "Nunito",
		},
		components: {
			Input,
			Heading: {
				baseStyles: {
					colorScheme: "purple",
				},
			},
		},
	},
	withDefaultColorScheme({ colorScheme: "purple" })
);

export default theme;
