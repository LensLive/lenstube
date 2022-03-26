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

const GET_PUBLICATIONS = `
  query($request: PublicationsQueryRequest!) {
    publications(request: $request) {
      items {
        __typename 
        ... on Post {
          ...PostFields
        }
        ... on Comment {
          ...CommentFields
        }
        ... on Mirror {
          ...MirrorFields
        }
      }
      pageInfo {
        prev
        next
        totalCount
      }
    }
  }

  fragment MediaFields on Media {
    url
    mimeType
  }

  fragment ProfileFields on Profile {
    id
    name
    bio
    location
    website
    twitterUrl
    handle
    picture {
      ... on NftImage {
        contractAddress
        tokenId
        uri
        verified
      }
      ... on MediaSet {
        original {
          ...MediaFields
        }
      }
    }
    coverPicture {
      ... on NftImage {
        contractAddress
        tokenId
        uri
        verified
      }
      ... on MediaSet {
        original {
          ...MediaFields
        }
      }
    }
    ownedBy
    depatcher {
      address
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
            name
            symbol
            decimals
            address
          }
          value
        }
        recipient
      }
    }
  }

  fragment PublicationStatsFields on PublicationStats { 
    totalAmountOfMirrors
    totalAmountOfCollects
    totalAmountOfComments
  }

  fragment MetadataOutputFields on MetadataOutput {
    name
    description
    content
    media {
      original {
        ...MediaFields
      }
    }
    attributes {
      displayType
      traitType
      value
    }
  }

  fragment Erc20Fields on Erc20 {
    name
    symbol
    decimals
    address
  }

  fragment CollectModuleFields on CollectModule {
    __typename
    ... on EmptyCollectModuleSettings {
      type
    }
    ... on FeeCollectModuleSettings {
      type
      amount {
        asset {
          ...Erc20Fields
        }
        value
      }
      recipient
      referralFee
    }
    ... on LimitedFeeCollectModuleSettings {
      type
      collectLimit
      amount {
        asset {
          ...Erc20Fields
        }
        value
      }
      recipient
      referralFee
    }
    ... on LimitedTimedFeeCollectModuleSettings {
      type
      collectLimit
      amount {
        asset {
          ...Erc20Fields
        }
        value
      }
      recipient
      referralFee
      endTimestamp
    }
    ... on RevertCollectModuleSettings {
      type
    }
    ... on TimedFeeCollectModuleSettings {
      type
      amount {
        asset {
          ...Erc20Fields
        }
        value
      }
      recipient
      referralFee
      endTimestamp
    }
  }

  fragment PostFields on Post {
    id
    profile {
      ...ProfileFields
    }
    stats {
      ...PublicationStatsFields
    }
    metadata {
      ...MetadataOutputFields
    }
    createdAt
    collectModule {
      ...CollectModuleFields
    }
    referenceModule {
      ... on FollowOnlyReferenceModuleSettings {
        type
      }
    }
    appId
  }

  fragment MirrorBaseFields on Mirror {
    id
    profile {
      ...ProfileFields
    }
    stats {
      ...PublicationStatsFields
    }
    metadata {
      ...MetadataOutputFields
    }
    createdAt
    collectModule {
      ...CollectModuleFields
    }
    referenceModule {
      ... on FollowOnlyReferenceModuleSettings {
        type
      }
    }
    appId
  }

  fragment MirrorFields on Mirror {
    ...MirrorBaseFields
    mirrorOf {
     ... on Post {
        ...PostFields          
     }
     ... on Comment {
        ...CommentFields          
     }
    }
  }

  fragment CommentBaseFields on Comment {
    id
    profile {
      ...ProfileFields
    }
    stats {
      ...PublicationStatsFields
    }
    metadata {
      ...MetadataOutputFields
    }
    createdAt
    collectModule {
      ...CollectModuleFields
    }
    referenceModule {
      ... on FollowOnlyReferenceModuleSettings {
        type
      }
    }
    appId
  }

  fragment CommentFields on Comment {
    ...CommentBaseFields
    mainPost {
      ... on Post {
        ...PostFields
      }
      ... on Mirror {
        ...MirrorBaseFields
        mirrorOf {
          ... on Post {
             ...PostFields          
          }
          ... on Comment {
             ...CommentMirrorOfFields        
          }
        }
      }
    }
  }

  fragment CommentMirrorOfFields on Comment {
    ...CommentBaseFields
    mainPost {
      ... on Post {
        ...PostFields
      }
      ... on Mirror {
         ...MirrorBaseFields
      }
    }
  }
`;

const ENABLED_CURRENCIES = `
  query {
    enabledModuleCurrencies {
      name
      symbol
      decimals
      address
    }
  }
`;

const ENABLED_MODULES = `
  query {
    enabledModules {
      collectModules {
        moduleName
        contractAddress
        inputParams {
          name
          type
        }
        redeemParams {
          name
          type
        }
        returnDataParms {
          name
          type
        }
      }
      followModules {
        moduleName
        contractAddress
        inputParams {
          name
          type
        }
        redeemParams {
          name
          type
        }
        returnDataParms {
          name
          type
        }
      }
      referenceModules {
        moduleName
        contractAddress
        inputParams {
          name
          type
        }
        redeemParams {
          name
          type
        }
        returnDataParms {
          name
          type
        }
      }
    }
    }
`;

const MODULE_APPROVAL_DATA = `
  query($request: GenerateModuleCurrencyApprovalDataRequest!) {
    generateModuleCurrencyApprovalData(request: $request) {
      to
      from
      data
    }
  }
`;

const ALLOWANCE = `
  query($request: ApprovedModuleAllowanceAmountRequest!) {
    approvedModuleAllowanceAmount(request: $request) {
      currency
      module
      contractAddress
      allowance
    }
  }
`;

const RECOMMENDED_PROFILES = `
  query {
    recommendedProfiles {
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
              width
              height
              mimeType
            }
            small {
              url
              width
              height
              mimeType
            }
            medium {
              url
              width
              height
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
              width
              height
              mimeType
            }
            small {
              height
              width
              url
              mimeType
            }
            medium {
              url
              width
              height
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

const DOES_FOLLOW = `
  query($request: DoesFollowRequest!) {
    doesFollow(request: $request) { 
            followerAddress
        profileId
        follows
        }
  }
`;

const CREATE_PROFILE = `
  mutation($request: CreateProfileRequest!) { 
    createProfile(request: $request) {
      ... on RelayerResult {
        txHash
      }
      ... on RelayError {
        reason
      }
            __typename
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

const HAS_TX_BEEN_INDEXED = `
  query($request: HasTxHashBeenIndexedRequest!) {
    hasTxHashBeenIndexed(request: $request) { 
             ... on TransactionIndexedResult {
        indexed
                txReceipt {
          to
          from
          contractAddress
          transactionIndex
          root
          gasUsed
          logsBloom
          blockHash
          transactionHash
          blockNumber
          confirmations
          cumulativeGasUsed
          effectiveGasPrice
          byzantium
          type
          status
          logs {
            blockNumber
            blockHash
            transactionIndex
            removed
            address
            data
            topics
            transactionHash
            logIndex
          }
        }
        metadataStatus {
          status
          reason
        }
        }
        ... on TransactionError {
        reason
                txReceipt {
          to
          from
          contractAddress
          transactionIndex
          root
          gasUsed
          logsBloom
          blockHash
          transactionHash
          blockNumber
          confirmations
          cumulativeGasUsed
          effectiveGasPrice
          byzantium
          type
          status
          logs {
            blockNumber
            blockHash
            transactionIndex
            removed
            address
            data
            topics
            transactionHash
            logIndex
          }
        }
        }
            __typename
        }
  }
`;

const CREATE_POST_TYPED_DATA = `
  mutation($request: CreatePublicPostRequest!) { 
    createPostTypedData(request: $request) {
      id
      expiresAt
      typedData {
        types {
          PostWithSig {
            name
            type
          }
        }
      domain {
        name
        chainId
        version
        verifyingContract
      }
      value {
        nonce
        deadline
        profileId
        contentURI
        collectModule
        collectModuleData
        referenceModule
        referenceModuleData
      }
     }
   }
 }
`;

function ApolloContextProvider({ children }) {
	const { wallet, account } = useContext(Web3Context);
	const [apolloContext, dispatch] = useReducer(apolloReducer, {});

	const apolloClient = new ApolloClient({
		link: authLink.concat(httpLink),
		cache: new InMemoryCache(),
	});

	useEffect(() => {
		if (wallet !== null && account !== null && account !== undefined) {
			getProfilesByAccount();
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

	async function getProfilesByProfileIds(request) {
		const response = await getProfilesRequest(request);
		return response;
	}

	async function getProfilesByAccount() {
		await login(account);

		let request = { ownedBy: account };

		const profilesFromProfileIds = await getProfilesRequest(request);
		dispatch({
			type: "SET_PROFILES",
			payload: profilesFromProfileIds.data.profiles.items,
		});

		if (profilesFromProfileIds.data.profiles.items) {
			console.log(profilesFromProfileIds);
			dispatch({ type: "CURRENT_PROFILE", payload: 0 });
		}
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

	async function getPublications(getPublicationQuery) {
		return apolloClient.query({
			query: gql(GET_PUBLICATIONS),
			variables: {
				request: getPublicationQuery,
			},
		});
	}

	async function enabledCurrencies() {
		// await login(account);
		return apolloClient.query({
			query: gql(ENABLED_CURRENCIES),
		});
	}

	async function enabledModules() {
		// await login(account);
		return apolloClient.query({
			query: gql(ENABLED_MODULES),
		});
	}

	async function getModuleApprovalData(moduleApprovalRequest) {
		await login(account);
		return apolloClient.query({
			query: gql(MODULE_APPROVAL_DATA),
			variables: {
				request: moduleApprovalRequest,
			},
		});
	}

	async function allowance(allowanceRequest) {
		await login(account);
		return apolloClient.query({
			query: gql(ALLOWANCE),
			variables: {
				request: allowanceRequest,
			},
		});
	}

	async function getRecommendedProfiles() {
		return apolloClient.query({
			query: gql(RECOMMENDED_PROFILES),
		});
	}

	async function doesFollow(followInfos) {
		await login(account);
		return apolloClient.query({
			query: gql(DOES_FOLLOW),
			variables: {
				request: {
					followInfos,
				},
			},
		});
	}

	async function createProfile(createProfileRequest) {
		await login(account);
		console.log(createProfileRequest);
		return apolloClient.mutate({
			mutation: gql(CREATE_PROFILE),
			variables: {
				request: createProfileRequest,
			},
		});
	}

	async function hasTxBeenIndexed(txHash) {
		return apolloClient.query({
			query: gql(HAS_TX_BEEN_INDEXED),
			variables: {
				request: {
					txHash,
				},
			},
			fetchPolicy: "network-only",
		});
	}

	const pollUntilIndexed = async (txHash) => {
		while (true) {
			console.log(txHash);
			const result = await hasTxBeenIndexed(txHash);
			const response = result.data.hasTxHashBeenIndexed;
			if (response.__typename === "TransactionIndexedResult") {
				if (response.metadataStatus) {
					if (response.metadataStatus.status === "SUCCESS") {
						return response;
					}

					if (
						response.metadataStatus.status ===
						"METADATA_VALIDATION_FAILED"
					) {
						throw new Error(response.metadataStatus.reason);
					}
				} else {
					if (response.indexed) {
						return response;
					}
				}

				console.log(response);
				// sleep for a second before trying again
				await new Promise((resolve) => setTimeout(resolve, 500));
			}
			console.log("out of loop");
			// it got reverted and failed!
			throw new Error(response.reason);
		}
	};

	async function createPostTypedData(createPostTypedDataRequest) {
		await login(account);
		return apolloClient.mutate({
			mutation: gql(CREATE_POST_TYPED_DATA),
			variables: {
				request: createPostTypedDataRequest,
			},
		});
	}

	return (
		<ApolloContext.Provider
			value={{
				apolloClient,
				authenticate,
				getProfiles: getProfilesByAccount,
				getProfilesByProfileIds,
				verify,
				updateProfile,
				apolloContext,
				dispatch,
				getNfts,
				updateProfilePictureUri,
				getPublications,
				enabledCurrencies,
				enabledModules,
				getModuleApprovalData,
				allowance,
				getRecommendedProfiles,
				doesFollow,
				createProfile,
				hasTxBeenIndexed,
				pollUntilIndexed,
				createPostTypedData,
			}}
		>
			{children}
		</ApolloContext.Provider>
	);
}

export default ApolloContextProvider;
