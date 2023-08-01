// source code from https://github.com/gitify-app/gitify/pull/538
import { fetchGithub } from '$lib/helpers/fetchGithub';
import type { GithubNotification } from '$lib/types';

const addHours = (date: string, hours: number) =>
	new Date(new Date(date).getTime() + hours * 36e5).toISOString();

const queryString = (repo: string, title: string, lastUpdated: string) =>
	`${title} in:title repo:${repo} updated:>${addHours(lastUpdated, -2)}`;
export type ViewerSubscription = 'IGNORED' | 'SUBSCRIBED' | 'UNSUBSCRIBED';

export const getLatestDiscussionCommentId = (comments: DiscussionCommentEdge[]) =>
	comments
		.flatMap((comment) => comment.node.replies.edges)
		.concat([comments.at(-1) || ({} as DiscussionCommentEdge)])
		.reduce((a, b) => (a.node.createdAt > b.node.createdAt ? a : b))?.node.databaseId;

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

export interface DiscussionCommentEdge {
	node: {
		databaseId: string | number;
		createdAt: string;
		replies: {
			edges: DiscussionSubCommentEdge[];
		};
	};
}

export interface DiscussionSubCommentEdge {
	node: {
		databaseId: string | number;
		createdAt: string;
	};
}

export async function getDiscussionUrl(notification: GithubNotification): Promise<{
	url: string;
	latestCommentId: string | number | undefined;
}> {
	const response: GraphQLSearch = await fetchGithub('graphql', {
		method: 'POST',
		body: {
			query: `{
      search(query:"${queryString(
				notification.repository.full_name,
				notification.subject.title,
				notification.updated_at
			)}", type: DISCUSSION, first: 10) {
          edges {
              node {
                  ... on Discussion {
                      viewerSubscription
                      title
                      url
                      comments(last: 100) {
                        edges {
                          node {
                            databaseId
                            createdAt
                            replies(last: 1) {
                              edges {
                                node {
                                  databaseId
                                  createdAt
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

	let latestCommentId: string | number | undefined;
	if (comments?.length) {
		latestCommentId = getLatestDiscussionCommentId(comments);
	}

	return {
		url: edges[0]?.node.url,
		latestCommentId
	};
}
