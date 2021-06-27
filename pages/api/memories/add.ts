import type { NextApiRequest, NextApiResponse } from "next";
import { GraphQLClient, gql } from "graphql-request";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const variables: { eventId: string; name: string; story: string } = req.body;

  const mutation = gql`
    mutation CreateMemory($eventId: ID!, $name: String!, $story: String!) {
      createMemory(
        data: {
          name: $name
          story: $story
          event: { connect: { id: $eventId } }
        }
      ) {
        id
      }
    }
  `;

  const client = new GraphQLClient(process.env.NEXT_PUBLIC_GRAPHCMS_URL, {
    headers: {
      Authorization: `Bearer ${process.env.GRAPHCMS_MUTATION_TOKEN}`,
    },
  });
  await client.request(mutation, variables);

  res.status(200).json({ success: true });
};
