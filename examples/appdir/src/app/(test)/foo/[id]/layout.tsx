import { z } from "zod";
import { withLayoutParamValidation } from "next-typesafe-url/app";
import type { DynamicLayout, InferLayoutPropsType } from "next-typesafe-url";

const LayoutRoute = {
  routeParams: z.object({
    id: z.number(),
  }),
} satisfies DynamicLayout;
type LayoutType = typeof LayoutRoute;

type Props = InferLayoutPropsType<LayoutType, "modal">;
function Layout({ children, routeParams, modal }: Props) {
  return (
    <div className="border border-black">
      <h1>THIS IS A LAYOUT</h1>
      <p>{JSON.stringify(routeParams)}</p>
      <div className="border border-black">{children}</div>
      <div className="border border-black">
        <h1>MODAL</h1>
        <div className="border border-green">{modal}</div>
      </div>
      <p>bottom</p>
    </div>
  );
}

export default withLayoutParamValidation(Layout, LayoutRoute);
