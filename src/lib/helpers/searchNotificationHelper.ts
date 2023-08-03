// source code from https://github.com/gitify-app/gitify/pull/538
import { fetchGithub } from '$lib/helpers/fetchGithub';
import type { GithubNotification } from '$lib/types';

export type ViewerSubscription = 'IGNORED' | 'SUBSCRIBED' | 'UNSUBSCRIBED';

export interface GraphQLSearch {
	data: {
		search: {
			edges: DiscussionEdge[];
		};
	};
}

export interface DiscussionEdge {
	node: {
		viewerSubscription: ViewerSubscription;
		title: string;
		url: string;
		comments: {
			edges: DiscussionCommentEdge[];
		};
	};
}

// https://docs.github.com/en/graphql/reference/interfaces#actor
export interface Actor {
	login: string;
	avatarUrl: string;
	__typename: 'Bot' | 'EnterpriseUserAccount' | 'Mannequin' | 'Organization' | 'User';
}

export interface DiscussionCommentEdge {
	node: {
		databaseId: string | number;
		createdAt: string;
		author: Actor;
		bodyText: string;
		replies: {
			edges: DiscussionSubCommentEdge[];
		};
	};
}

export interface DiscussionSubCommentEdge {
	node: {
		databaseId: string | number;
		createdAt: string;
		author: Actor;
		bodyText: string;
	};
}

const addHours = (date: string, hours: number) =>
	new Date(new Date(date).getTime() + hours * 36e5).toISOString();

const queryString = (repo: string, title: string, lastUpdated: string) =>
	`${title} in:title repo:${repo} updated:>${addHours(lastUpdated, -2)}`;

export const getLatestDiscussionCommentEdge = (comments: DiscussionCommentEdge[]) =>
	comments
		.flatMap((comment) => comment.node.replies.edges)
		.concat([comments.at(-1) || ({} as DiscussionCommentEdge)])
		.reduce((a, b) => (a.node.createdAt > b.node.createdAt ? a : b));

export async function getDiscussionUrl(notification: GithubNotification): Promise<{
	url: string;
	latestCommentEdge: DiscussionSubCommentEdge | undefined;
}> {
	const response: GraphQLSearch = await fetchGithub('graphql', {
		method: 'POST',
		body: {
			query: `{
        search(query:"${queryString(
					notification.repository.full_name,
					notification.subject.title,
					notification.updated_at
				)}",        
			  type: DISCUSSION
        first: 10
    ) {
        edges {
            node {
                ... on Discussion {
                    viewerSubscription
                    title
                    url
                    comments(last: 100) {
                        edges {
                            node {
                                author {
                                    login
                                    avatarUrl
                                    __typename
                                }
                                bodyText
                                databaseId
                                createdAt
                                replies(last: 1) {
                                    edges {
                                        node {
                                            databaseId
                                            createdAt
                                            author {
                                                login
                                                avatarUrl
                                                __typename
                                            }
                                            bodyText
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
      }
    }`
		}
	});

	let edges =
		response?.data?.search?.edges?.filter(
			(edge) => edge.node.title === notification.subject.title
		) || [];
	if (edges.length > 1)
		edges = edges.filter((edge) => edge.node.viewerSubscription === 'SUBSCRIBED');

	const comments = edges[0]?.node.comments.edges;

	let latestCommentEdge: DiscussionSubCommentEdge | undefined;
	if (comments?.length) {
		latestCommentEdge = getLatestDiscussionCommentEdge(comments);
	}

	return {
		url: edges[0]?.node.url,
		latestCommentEdge
	};
}
