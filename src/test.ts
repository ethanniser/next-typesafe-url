import { z } from "zod";
import { $path } from ".";
import React from "react";
import { withParamValidation } from ".";
import type { InferPagePropsType } from "./types";
import { renderToString } from "react-dom/server";
import type { NextPage } from "next";

const Route = {
  searchParams: z.object({
    name: z.string().optional(),
  }),
  routeParams: z.object({
    slug: z.number(),
  }),
};
export type RouteType = typeof Route;

type X = InferPagePropsType<RouteType>;

const page = (props: InferPagePropsType<RouteType>) =>
  React.createElement("h1", null, `slug: ${props.routeParams.slug}`);

const validatedComponent = withParamValidation(page, Route);

export default withParamValidation(page, Route);

const x = validatedComponent({ params: { slug: "10" }, searchParams: {} });

console.log(renderToString(x));
