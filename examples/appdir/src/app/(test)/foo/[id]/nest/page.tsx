import { withParamValidation } from "next-typesafe-url/app";
import { InferPagePropsType } from "next-typesafe-url";
import { Route, RouteType } from "./routeType";
import { $path } from "next-typesafe-url";
import Link from "next/link";

type PageProps = InferPagePropsType<RouteType>;

const Page = ({ routeParams }: PageProps) => {
  return (
    <>
      <div className="border border-black">
        <h1>NORMAL NEST PAGE</h1>
        <div>{`route: ${JSON.stringify(routeParams)}`}</div>
      </div>
    </>
  );
};

export default withParamValidation(Page, Route);
