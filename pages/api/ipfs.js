import { NFTStorage, File } from "nft.storage";
import fs from "fs";

const client = new NFTStorage({
	token: process.env.NFT_STORAGE_API_KEY,
});

export default async function handler(req, res) {
	if (req.method == "POST") {
		console.log(req.);
		return res.status(200).json({ status: "success" });
	} else {
		return res.status(404);
	}
}
