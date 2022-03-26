import {
	VStack,
	Text,
	Box,
	Heading,
	HStack,
	Avatar,
	AccordionButton,
} from "@chakra-ui/react";
import svgAvatarGenerator from "./svgAvatarGenerator";
import Link from "next/link";

export default function Sidebar({ recommendedProfiles }) {
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
				<VStack width="100%">
					{recommendedProfiles
						? recommendedProfiles.map((profile) => {
								return (
									<Link
										key={profile.id}
										href={`/user/${profile.id}`}
									>
										<HStack
											width="100%"
											justifyContent="flex-start"
										>
											{profile.picture ? (
												<Avatar
													src={
														profile.picture.original
															.url
													}
												/>
											) : (
												<Avatar
													backgroundColor="white"
													borderWidth="2px"
													borderColor="purple.400"
													size="md"
													bg="transparent"
													src={svgAvatarGenerator(
														profile.ownedBy,
														{
															dataUri: true,
														}
													)}
												/>
											)}

											<VStack
												alignItems="flex-start"
												spacing="0"
											>
												<span>{profile.name}</span>
												<span>{profile.handle}</span>
											</VStack>
										</HStack>
									</Link>
								);
						  })
						: null}
				</VStack>
				{/* 				
				<HStack width="100%" justifyContent="flex-start">
					<Avatar size="md" src="https://bit.ly/dan-abramov" />
					<VStack spacing="0">
						<span>Username</span>
						<span>Followers</span>
					</VStack>
				</HStack> */}
			</VStack>
		</VStack>
	);
}
