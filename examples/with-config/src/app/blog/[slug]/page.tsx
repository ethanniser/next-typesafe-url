import { PageProps, Route } from "./route-type";
import { withParamValidation } from "next-typesafe-url/app/hoc";

async function BlogPost({ routeParams }: PageProps) {
  const { slug } = await routeParams;

  return (
    <div>
      <h1>Blog Post: {slug}</h1>
      <p>
        This route demonstrates type-safe dynamic route parameters using
        next-typesafe-url.
      </p>
      <p>
        The <code>slug</code> parameter is validated at runtime and fully typed
        at compile time.
      </p>
    </div>
  );
}

export default withParamValidation(BlogPost, Route);
