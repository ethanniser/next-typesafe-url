import { withParamValidation } from "next-typesafe-url/app/hoc";
import { withParamValidation as withParamValidation2 } from "next-typesafe-url/app";
import { InferPagePropsType } from "next-typesafe-url";
import { Route, RouteType } from "./routeType";
import type { Metadata, ResolvingMetadata } from "next";

type PageProps = InferPagePropsType<RouteType>;

const Page = ({ searchParams }: PageProps) => {
  return (
    <>
      <div>{searchParams.foo}</div>
      <div>{searchParams.bar}</div>
    </>
  );
};

export default withParamValidation(Page, Route);

async function genMetadata(
  { routeParams, searchParams }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return {
    title: `${searchParams.foo} - ${searchParams.bar}`,
    description: `${searchParams.foo} - ${searchParams.bar}`,
  };
}

export const generateMetadata = withParamValidation2(genMetadata, Route);
