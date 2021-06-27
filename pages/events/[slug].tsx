import { useState } from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import useSWR from "swr";
import { GraphQLClient, gql } from "graphql-request";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";

export default function Event({}: {}) {
  return <main>Events</main>;
}
