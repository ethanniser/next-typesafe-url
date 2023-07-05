import type {
  InferGetServerSidePropsType,
  NextPage,
  GetServerSideProps,
} from "next";
import { z } from "zod";
import { $path, type RouterOutputs } from "next-typesafe-url";
import {
  parseServerSideRouteParams,
  parseServerSideSearchParams,
} from "next-typesafe-url/pages";
import Link from "next/link";

const Route = {
  routeParams: z.object({
    slug: z.string(),
  }),
  searchParams: z.object({
    location: z.enum(["us", "eu"]),
  }),
};
export type RouteType = typeof Route;

type ServerSideProps = RouterOutputs["/[slug]/server"]["searchParams"] &
  RouterOutputs["/[slug]/server"]["routeParams"];

export const getServerSideProps: GetServerSideProps<ServerSideProps> = async ({
  query,
  params,
}) => {
  await Promise.resolve();
  const routeParams = parseServerSideRouteParams({
    params,
    validator: Route.routeParams,
  });

  const searchParams = parseServerSideSearchParams({
    query,
    validator: Route.searchParams,
  });

  if (routeParams.isError || searchParams.isError) {
    console.log(routeParams.error?.message, searchParams.error?.message);
    throw new Error("Invalid route or search params");
  } else {
    return {
      props: {
        ...routeParams.data,
        ...searchParams.data,
      },
    };
  }
};

type PageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const Page: NextPage<PageProps> = (props) => {
  return (
    <>
      <Link href={$path({ route: "/" })}>Back</Link>
      <div>slug: {props.slug}</div>
      <div>location: {props.location}</div>
    </>
  );
};
export default Page;
