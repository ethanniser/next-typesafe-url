import { z } from "zod";
import { $path } from ".";
import React from "react";
import { withParamValidation } from ".";
import { renderToString } from 'react-dom/server';

const Route = {
  searchParams: z.object({
    name: z.string().optional(),
  }),
  routeParams: z.object({
    slug: z.number(),
  }),
};
export type RouteType = typeof Route;

type X = {
  searchParams: z.infer<RouteType['searchParams']>,
  routeParams: z.infer<RouteType['routeParams']>
}

const page = (props: X) => React.createElement('h1', null, `slug: ${props.routeParams.slug}`);

const validatedComponent = withParamValidation(page, Route);

export default withParamValidation(page, Route);

const x = validatedComponent({params: {slug: "10"}, searchParams: {}})

console.log(renderToString(x))
