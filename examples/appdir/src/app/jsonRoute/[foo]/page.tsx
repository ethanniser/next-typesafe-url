import { withParamValidation } from "next-typesafe-url/app/hoc";
import { InferPagePropsType } from "next-typesafe-url";
import { Route, RouteType } from "./routeType";

type PageProps = InferPagePropsType<RouteType>;

const Page = ({ routeParams }: PageProps) => {
  console.log(routeParams.foo === undefined);

  return (
    <>
      <div>{`data: ${JSON.stringify(routeParams)}`}</div>
    </>
  );
};

export default withParamValidation(Page, Route);
