import {
	VStack,
	Text,
	Box,
	Heading,
	HStack,
	Avatar,
	AccordionButton,
} from "@chakra-ui/react";
import { ApolloContext } from "../context/ApolloContext";
import { useContext, useState, useEffect } from "react";
import svgAvatarGenerator from "./svgAvatarGenerator";
import { Web3Context } from "../context/Web3Context";
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
									<HStack
										width="100%"
										key={profile.id}
										justifyContent="flex-start"
									>
										{profile.picture ? (
											<Avatar
												src={
													profile.picture.original.url
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
