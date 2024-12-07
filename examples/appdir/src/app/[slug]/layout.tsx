import { z } from "zod";
import { withLayoutParamValidation } from "next-typesafe-url/app/hoc";
import type { DynamicLayout, InferLayoutPropsType } from "next-typesafe-url";
import { Suspense } from "react";

const LayoutRoute = {
  routeParams: z.object({
    slug: z.string(),
  }),
} satisfies DynamicLayout;
type LayoutType = typeof LayoutRoute;

type Props = InferLayoutPropsType<LayoutType>;
async function Inner({ children, routeParams }: Props) {
  return (
    <Suspense>
      <div>
        <h1>THIS IS A LAYOUT</h1>
        <p>{JSON.stringify(await routeParams)}</p>
        <div className="border border-black">{children}</div>
        <p>bottom</p>
      </div>
    </Suspense>
  );
}
function Layout(props: Props) {
  return (
    <Suspense>
      <Inner {...props} />
    </Suspense>
  );
}

export default withLayoutParamValidation<LayoutType>(Layout, LayoutRoute);
