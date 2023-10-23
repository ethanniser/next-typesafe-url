import { withParamValidation } from "next-typesafe-url/app/hoc";
import { InferPagePropsType } from "next-typesafe-url";
import { Route, RouteType } from "./routeType";
import Link from "next/link";
import { $path } from "next-typesafe-url";

type PageProps = InferPagePropsType<RouteType>;

const Page = ({ searchParams }: PageProps) => {
  const newParams: typeof searchParams.countries =
    searchParams.countries?.includes("DE") ? ["NL", "UK"] : ["NL", "UK", "DE"];

  return (
    <>
      <div>
        ArrayFormatSeparator:
        <ul>
          {searchParams?.countries?.map((country) => (
            <li key={country}>{country}</li>
          ))}
        </ul>
      </div>

      <Link
        href={$path({
          route: "/arrayFormatSeparator",
          searchParams: { countries: newParams },
          options: Route.options,
        })}
      >
        Push new
      </Link>
    </>
  );
};

export default withParamValidation(Page, Route);
