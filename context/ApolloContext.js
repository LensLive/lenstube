import React, { useContext, useEffect, useState } from "react";
import {
	ApolloClient,
	InMemoryCache,
	gql,
	ApolloLink,
	HttpLink,
} from "@apollo/client";
import fetch from "cross-fetch";
import { Web3Context } from "./Web3Context";

export const ApolloContext = React.createContext();

const httpLink = new HttpLink({
	uri: process.env.NEXT_PUBLIC_API_URL,
	fetch,
});

const authLink = new ApolloLink((operation, forward) => {
	const token = localStorage.getItem("lensAPIAccessToken");

	// Use the setContext method to set the HTTP headers.
	operation.setContext({
		headers: {
			"x-access-token": token ? `Bearer ${token}` : "",
		},
	});

	// Call the next link in the middleware chain.
	return forward(operation);
});

const GET_CHALLENGE = `
  query($request: ChallengeRequest!) {
    challenge(request: $request) { text }
  }
`;

const AUTHENTICATION = `
  mutation($request: SignedAuthChallenge!) { 
    authenticate(request: $request) {
      accessToken
      refreshToken
    }
 }
`;

const VERIFY = `
  query($request: VerifyRequest!) {
    verify(request: $request)
  }
`;

const GET_PROFILES = `
  query($request: ProfileQueryRequest!) {
    profiles(request: $request) {
      items {
        id
        name
        bio
        location
        website
        twitterUrl
        picture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        handle
        coverPicture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              url
              mimeType
            }
          }
          __typename
        }
        ownedBy
        depatcher {
          address
          canUseRelay
        }
        stats {
          totalFollowers
          totalFollowing
          totalPosts
          totalComments
          totalMirrors
          totalPublications
          totalCollects
        }
        followModule {
          ... on FeeFollowModuleSettings {
            type
            amount {
              asset {
                symbol
                name
                decimals
                address
              }
              value
            }
            recipient
          }
          __typename
        }
      }
      pageInfo {
        prev
        next
        totalCount
      }
    }
  }
`;

const prettyJSON = (message, obj) => {
	console.log(message, JSON.stringify(obj, null, 2));
};

const sleep = (milliseconds) => {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

function ApolloContextProvider({ children }) {
	const { wallet, account } = useContext(Web3Context);
	const [profiles, setProfiles] = useState([]);
	const [currentProfile, setCurrentProfile] = useState(null);

	const apolloClient = new ApolloClient({
		link: authLink.concat(httpLink),
		cache: new InMemoryCache(),
	});

	useEffect(() => {
		if (wallet !== null && account !== null) {
			console.log("getting profiles");
			getProfiles();
		}
	}, [account]);

	useEffect(() => {
		if (profiles.length > 0) {
			setCurrentProfile(profiles[0]);
		}
	}, [profiles]);

	const generateChallenge = (address) => {
		return apolloClient.query({
			query: gql(GET_CHALLENGE),
			variables: {
				request: {
					address,
				},
			},
		});
	};

	const authenticate = (address, signature) => {
		return apolloClient.mutate({
			mutation: gql(AUTHENTICATION),
			variables: {
				request: {
					address,
					signature,
				},
			},
		});
	};

	const verify = (accessToken) => {
		return apolloClient.query({
			query: gql(VERIFY),
			variables: {
				request: {
					accessToken,
				},
			},
		});
	};

	const getProfilesRequest = (request) => {
		return apolloClient.query({
			query: gql(GET_PROFILES),
			variables: {
				request,
			},
		});
	};

	async function signChallenge(address) {
		const signer = await wallet.getSigner();
		const challengeResponse = await generateChallenge(address);
		const signature = await signer.signMessage(
			challengeResponse.data.challenge.text
		);

		const accessTokens = await authenticate(address, signature);
		console.log(accessTokens.data);
		localStorage.setItem(
			"lensAPIAccessToken",
			accessTokens.data.authenticate.accessToken
		);
		localStorage.setItem(
			"lensAPIRefreshToken",
			accessTokens.data.authenticate.refreshToken
		);
	}

	async function login() {
		let authenticationToken = localStorage.getItem("lensAPIAccessToken");
		if (authenticationToken) {
			let isAuthenticated = (await verify(authenticationToken)).data
				.verify;
			console.log(isAuthenticated);
			if (!isAuthenticated) {
				await signChallenge(account);
			}
		} else {
			await signChallenge(account);
		}
	}

	async function getProfiles() {
		await login(account);

		let request = { ownedBy: account };

		const profilesFromProfileIds = await getProfilesRequest(request);

		prettyJSON("profiles: result", profilesFromProfileIds.data);
		setProfiles([...profilesFromProfileIds.data.profiles.items]);
		console.log(profilesFromProfileIds.data);
	}

	return (
		<ApolloContext.Provider
			value={{
				apolloClient,
				authenticate,
				getProfiles,
				verify,
				profiles,
				currentProfile,
				setCurrentProfile,
			}}
		>
			{children}
		</ApolloContext.Provider>
	);
}

export default ApolloContextProvider;
