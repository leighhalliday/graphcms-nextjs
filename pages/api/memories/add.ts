import type { NextApiRequest, NextApiResponse } from "next";
import { GraphQLClient, gql } from "graphql-request";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({ success: true });
};
