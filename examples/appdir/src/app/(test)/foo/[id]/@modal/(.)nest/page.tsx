import { withParamValidation } from "next-typesafe-url/app/hoc";
import { InferPagePropsType } from "next-typesafe-url";
import { Route, RouteType } from "../../nest/routeType";
import { $path } from "next-typesafe-url";
import Link from "next/link";
import { Suspense } from "react";

type PageProps = InferPagePropsType<RouteType>;

const Inner = async ({ routeParams }: PageProps) => {
  const params = await routeParams;
  return (
    <div className="border border-black">
      <h1>INTERCEPT</h1>
      <div>{`route: ${JSON.stringify(params)}`}</div>
      <Link
        href={$path({
          route: "/foo/[id]",
          routeParams: { id: params.id },
        })}
      >
        BACK
      </Link>
    </div>
  );
};

const Page = (props: PageProps) => {
  return (
    <Suspense>
      <Inner {...props} />
    </Suspense>
  );
};

export default withParamValidation(Page, Route);
