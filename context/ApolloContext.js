import React, { useContext, useEffect, useState, useReducer } from "react";
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

const UPDATE_PROFILE = `
  mutation($request: UpdateProfileRequest!) { 
    updateProfile(request: $request) {
     id
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
 }
`;

const GET_USERS_NFTS = `
  query($request: NFTsRequest!) {
    nfts(request: $request) {
      items {
        contractName
        contractAddress
        symbol
        tokenId
        owners {
          amount
          address
        }
        name
        description
        contentURI
        originalContent {
          uri
          metaType
        }
        chainId
        collectionName
        ercType
      }
    pageInfo {
        prev
        next
        totalCount
    }
  }
}
`;

const NFT_CHALLENGE = `
  query($request: NftOwnershipChallengeRequest!) {
    nftOwnershipChallenge(request: $request) { id, text }
  }
`;

const CREATE_SET_PROFILE_IMAGE_URI_TYPED_DATA = `
  mutation($request: UpdateProfileImageRequest!) { 
    createSetProfileImageURITypedData(request: $request) {
      id
      expiresAt
      typedData {
        domain {
          name
          chainId
          version
          verifyingContract
        }
        types {
          SetProfileImageURIWithSig {
            name
            type
          }
        }
        value {
          nonce
            deadline
            imageURI
            profileId
        }
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

const apolloReducer = (state, action) => {
	switch (action.type) {
		case "SET_PROFILES":
			return { profiles: action.payload };
		case "SET_PROFILE":
			console.log(action.payload);
			let profile = action.payload;
			let id = profile.id;
			return {
				...state,
				profiles: state.profiles.map((profile) => {
					if (profile.id == id) {
						return action.payload;
					} else return profile;
				}),
			};
		case "CURRENT_PROFILE":
			return { ...state, currentProfile: action.payload };
		case "SET_NFTS":
			return { ...state, nfts: action.payload };
	}
};

function ApolloContextProvider({ children }) {
	const { wallet, account } = useContext(Web3Context);
	const [apolloContext, dispatch] = useReducer(apolloReducer, {});

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

		dispatch({
			type: "SET_PROFILES",
			payload: [...profilesFromProfileIds.data.profiles.items],
		});
		dispatch({ type: "CURRENT_PROFILE", payload: 0 });
	}

	async function updateProfile(profileInfo) {
		await login(account);

		return apolloClient.mutate({
			mutation: gql(UPDATE_PROFILE),
			variables: {
				request: profileInfo,
			},
		});
	}

	async function getUsersNfts(contractAddress) {
		await login(account);
		return apolloClient.query({
			query: gql(GET_USERS_NFTS),
			variables: {
				request: {
					ownerAddress: account,
					contractAddress,
					chainIds: [80001],
					limit: 20,
				},
			},
		});
	}

	async function getNfts(contractAddress) {
		let { data } = await getUsersNfts(contractAddress);
		console.log(data);
		dispatch({ type: "SET_NFTS", payload: data.nfts.items });
	}

	const generateNftChallenge = (nfts) => {
		return apolloClient.query({
			query: gql(NFT_CHALLENGE),
			variables: {
				request: {
					ethereumAddress: account,
					nfts,
				},
			},
		});
	};

	const createSetProfileImageUriTypedData = (request) => {
		return apolloClient.mutate({
			mutation: gql(CREATE_SET_PROFILE_IMAGE_URI_TYPED_DATA),
			variables: {
				request,
			},
		});
	};

	async function updateProfilePictureUri(profileId, index) {
		let { contractAddress, tokenId, chainId } = apolloContext.nfts[index];
		let { data } = await generateNftChallenge([
			{ contractAddress, tokenId, chainId },
		]);

		let signer = await wallet.getSigner();
		let signature = await signer.signMessage(
			data.nftOwnershipChallenge.text
		);
		let response = await createSetProfileImageUriTypedData({
			profileId,
			nftData: {
				id: data.nftOwnershipChallenge.id,
				signature,
			},
		});
		console.log(response);
	}

	return (
		<ApolloContext.Provider
			value={{
				apolloClient,
				authenticate,
				getProfiles,
				verify,
				updateProfile,
				apolloContext,
				dispatch,
				getNfts,
				updateProfilePictureUri,
			}}
		>
			{children}
		</ApolloContext.Provider>
	);
}

export default ApolloContextProvider;
