import { useState } from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import useSWR from "swr";
import { GraphQLClient, gql } from "graphql-request";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";

const client = new GraphQLClient(process.env.NEXT_PUBLIC_GRAPHCMS_URL);

interface IEvent {
  id: string;
  slug: string;
  title: string;
  date: string;
  image: {
    url: string;
  };
  description: string;
  source: { compiledSource: string };
}

export default function Event({ event }: { event: IEvent }) {
  return (
    <main>
      <h1>{event.title}</h1>
      <h2>{event.date}</h2>
      <img src={event.image.url} alt={event.title} />
      <div>
        <MDXRemote {...event.source} />
      </div>

      <Memories eventId={event.id} />
      <NewMemory eventId={event.id} />
    </main>
  );
}

function NewMemory({ eventId }: { eventId: string }) {
  const [name, setName] = useState("");
  const [story, setStory] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();

    await fetch("/api/memories/add", {
      method: "POST",
      body: JSON.stringify({ name, story, eventId }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    setName("");
    setStory("");
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Your name"
        required
      />
      <textarea
        value={story}
        onChange={(event) => setStory(event.target.value)}
        placeholder="Your story"
        required
      />
      <button type="submit">Add Story</button>
    </form>
  );
}

const fetchMemories = async (id: string) => {
  const query = gql`
    query Memories($id: ID!) {
      memories(where: { event: { id: $id } }) {
        id
        name
        story
      }
    }
  `;
  return client.request(query, { id });
};

function Memories({ eventId }: { eventId: string }) {
  const { data } = useSWR(eventId, fetchMemories);

  if (!data) return null;

  return (
    <div>
      <h2>Memories</h2>
      {data.memories.map((memory) => (
        <blockquote key={memory.id}>
          {memory.story} - {memory.name}
        </blockquote>
      ))}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params.slug as string;

  const query = gql`
    query Event($slug: String!) {
      event(where: { slug: $slug }) {
        id
        slug
        title
        date
        description
        image {
          url
        }
      }
    }
  `;

  const data: { event: IEvent | null } = await client.request(query, { slug });

  if (!data.event) {
    return {
      notFound: true,
    };
  }

  const source = await serialize(data.event.description);

  return {
    props: { event: { ...data.event, source } },
    revalidate: 60 * 60,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const query = gql`
    query Events {
      events {
        slug
      }
    }
  `;
  const data = await client.request(query);

  return {
    paths: data.events.map((event) => ({ params: { slug: event.slug } })),
    fallback: "blocking",
  };
};
