import { GraphQLClient, gql } from "graphql-request";
import { GetServerSideProps } from "next";
import Link from "next/link";

export default function Home({ events }) {
  return (
    <main>
      <h1>Great Memories</h1>
      <ul>
        {events.map((event) => (
          <li key={event.slug}>
            <Link href={`/events/${event.slug}`}>
              <a>{event.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const client = new GraphQLClient(process.env.NEXT_PUBLIC_GRAPHCMS_URL);
  const query = gql`
    query Events {
      events {
        id
        slug
        title
      }
    }
  `;
  const data = await client.request(query);

  return {
    props: { events: data.events },
  };
};
