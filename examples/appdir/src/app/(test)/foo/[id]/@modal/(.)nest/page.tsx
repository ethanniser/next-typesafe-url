import { withParamValidation } from "next-typesafe-url/app";
import { InferPagePropsType } from "next-typesafe-url";
import { Route, RouteType } from "../../nest/routeType";
import { $path } from "next-typesafe-url";
import Link from "next/link";

type PageProps = InferPagePropsType<RouteType>;

const Page = ({ routeParams }: PageProps) => {
  return (
    <>
      <div className="border border-black">
        <h1>INTERCEPT</h1>
        <div>{`route: ${JSON.stringify(routeParams)}`}</div>
        <Link
          href={$path({
            route: "/foo/[id]",
            routeParams: { id: routeParams.id },
          })}
        >
          BACK
        </Link>
      </div>
    </>
  );
};

export default withParamValidation(Page, Route);
