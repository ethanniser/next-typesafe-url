import { z } from "zod";
import {
  withLayoutParamValidation,
  type DynamicLayout,
} from "next-typesafe-url/app";

const LayoutValidator = {
  routeParams: z.object({
    slug: z.string(),
  }),
} satisfies DynamicLayout;

function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Record<string, string | string[]>;
}) {
  return (
    <div>
      <h1>THIS IS A LAYOUT</h1>
      <p>{JSON.stringify(params)}</p>
      <div className="border border-black">{children}</div>
      <p>bottom</p>
    </div>
  );
}

export default withLayoutParamValidation(Layout, LayoutValidator);
