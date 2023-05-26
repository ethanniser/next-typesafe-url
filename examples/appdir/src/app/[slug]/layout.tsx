import { z } from "zod";
import {
  withLayoutParamValidation,
  type DynamicLayout,
  type InferLayoutPropsType,
} from "next-typesafe-url/app";

const LayoutRoute = {
  routeParams: z.object({
    slug: z.string(),
  }),
} satisfies DynamicLayout;
type LayoutType = typeof LayoutRoute

type Props = InferLayoutPropsType<LayoutType>
function Layout({
  children,
  routeParams,
}: Props) {
  return (
    <div>
      <h1>THIS IS A LAYOUT</h1>
      <p>{JSON.stringify(routeParams)}</p>
      <div className="border border-black">{children}</div>
      <p>bottom</p>
    </div>
  );
}

export default withLayoutParamValidation(Layout, LayoutRoute);
