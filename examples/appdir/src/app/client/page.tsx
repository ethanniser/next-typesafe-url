import { withParamValidation } from "next-typesafe-url/app";
import { InferPagePropsType } from "next-typesafe-url/app";
import { Route, RouteType } from "./routeType";
import { Client } from "./client";

type PageProps = InferPagePropsType<RouteType>;

let count = 0;

export default function Page() {
  return (
    <>
      <div>on server</div>
      <Client />
    </>
  );
}
