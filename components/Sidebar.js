import { VStack, Text, Box, Heading, HStack, Avatar } from "@chakra-ui/react";
export default function Sidebar() {
	return (
		<VStack height="100%" width="100%" padding={5}>
			<VStack
				borderWidth="2px"
				width="100%"
				padding={5}
				borderRadius="6px"
				alignItems="flex-start"
			>
				<Heading size="md">Recommeded Profiles</Heading>
				<HStack width="100%" justifyContent="flex-start">
					<Avatar size="md" src="https://bit.ly/dan-abramov" />
					<VStack spacing="0">
						<span>Username</span>
						<span>Followers</span>
					</VStack>
				</HStack>
				<HStack width="100%" justifyContent="flex-start">
					<Avatar size="md" src="https://bit.ly/dan-abramov" />
					<VStack spacing="0">
						<span>Username</span>
						<span>Followers</span>
					</VStack>
				</HStack>
			</VStack>
		</VStack>
	);
}
