import {
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	Link,
	MenuGroup,
	MenuDivider,
	Image,
	Button,
	Text,
} from "@chakra-ui/react";
import { FiSettings } from "react-icons/fi";
import { AiOutlineUser } from "react-icons/ai";

export function ProfileMenu() {
	return (
		<Menu>
			<MenuButton as={Button}>Profiles</MenuButton>
			<MenuList>
				<MenuItem>Logged in as Dan Abramov</MenuItem>
				<MenuDivider />
				<MenuGroup title="Account">
					<MenuItem icon={<AiOutlineUser />}>
						<Link href="/settings">
							<Text>Profile</Text>
						</Link>
					</MenuItem>
					<MenuItem icon={<FiSettings />}>
						<Link href="/settings">
							<Text>Settings</Text>
						</Link>
					</MenuItem>
				</MenuGroup>
				<MenuDivider />
				<MenuGroup title="Switch Account">
					<MenuItem>
						<Image
							w={5}
							mr={3}
							borderRadius="full"
							src="https://bit.ly/dan-abramov"
						/>
						<span>Dan Abramov</span>
					</MenuItem>
				</MenuGroup>
			</MenuList>
		</Menu>
	);
}
