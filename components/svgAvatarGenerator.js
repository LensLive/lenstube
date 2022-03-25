import { createAvatar } from "@dicebear/avatars";
import * as style from "@dicebear/micah";

const svgAvatarGenerator = (seed, config) => {
	let svg = createAvatar(style, {
		seed: seed,
		mouth: ["laughing", "smile", "smirk"],
		...config,
	});

	return svg;
};

export default svgAvatarGenerator;
