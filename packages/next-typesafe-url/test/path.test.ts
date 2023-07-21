import { describe, expect, test } from "vitest";
import { $path } from "../src";

// @ts-expect-error -- test
const $testPath: (args: {
  route: string;
  searchParams?: Record<string, unknown>;
  routeParams?: Record<string, unknown>;
}) => string = $path;

describe("static paths", () => {
  test("index path", () => {
    expect($testPath({ route: "/" })).toBe("/");
  });
  test("basic path", () => {
    expect($testPath({ route: "/foo" })).toBe("/foo");
  });
  test("nested path", () => {
    expect($testPath({ route: "/foo/bar" })).toBe("/foo/bar");
  });
});

describe("search params", () => {
  test("string", () => {
    expect($testPath({ route: "/foo/bar", searchParams: { baz: "hi" } })).toBe(
      "/foo/bar?baz=hi"
    );
  });
  test("number", () => {
    expect($testPath({ route: "/foo/bar", searchParams: { baz: 1 } })).toBe(
      "/foo/bar?baz=1"
    );
  });
  test("boolean", () => {
    expect($testPath({ route: "/foo/bar", searchParams: { baz: true } })).toBe(
      "/foo/bar?baz=true"
    );
  });
  test("multiple ", () => {
    expect(
      $testPath({
        route: "/foo/bar",
        searchParams: { baz: true, qux: "hi", quux: 1 },
      })
    ).toBe("/foo/bar?baz=true&qux=hi&quux=1");
  });
  test("undefined", () => {
    expect(
      $testPath({
        route: "/foo/bar",
        searchParams: { baz: undefined },
      })
    ).toBe("/foo/bar?baz");
  });
  test("null", () => {
    expect(
      $testPath({
        route: "/foo/bar",
        searchParams: { baz: null },
      })
    ).toBe("/foo/bar?baz=null");
  });
  test("empty string", () => {
    expect(
      $testPath({
        route: "/foo/bar",
        searchParams: { baz: "" },
      })
    ).toBe("/foo/bar?baz");
  });
  test("flat array", () => {
    expect(
      $testPath({ route: "/foo/bar", searchParams: { baz: ["hi", "bye"] } })
    ).toBe("/foo/bar?baz=%5B%22hi%22%2C%22bye%22%5D");
  });
  test("flat object", () => {
    expect(
      $testPath({
        route: "/foo/bar",
        searchParams: { baz: { hi: "bye", bye: "hi" } },
      })
    ).toBe("/foo/bar?baz=%7B%22hi%22%3A%22bye%22%2C%22bye%22%3A%22hi%22%7D");
  });
  test("nested array", () => {
    expect(
      $testPath({
        route: "/foo/bar",
        searchParams: { baz: [["hi"], ["bye"]] },
      })
    ).toBe("/foo/bar?baz=%5B%5B%22hi%22%5D%2C%5B%22bye%22%5D%5D");
  });
  test("nested object", () => {
    expect(
      $testPath({
        route: "/foo/bar",
        searchParams: { baz: { hi: { bye: "hi" }, bye: { hi: "bye" } } },
      })
    ).toBe(
      "/foo/bar?baz=%7B%22hi%22%3A%7B%22bye%22%3A%22hi%22%7D%2C%22bye%22%3A%7B%22hi%22%3A%22bye%22%7D%7D"
    );
  });
  test("nested object and arary", () => {
    expect(
      $testPath({
        route: "/foo/bar",
        searchParams: {
          baz: { hi: { bye: "hi" }, bye: [{ hi: "bye" }, { bye: "hi" }] },
        },
      })
    ).toBe(
      "/foo/bar?baz=%7B%22hi%22%3A%7B%22bye%22%3A%22hi%22%7D%2C%22bye%22%3A%5B%7B%22hi%22%3A%22bye%22%7D%2C%7B%22bye%22%3A%22hi%22%7D%5D%7D"
    );
  });
  test("function", () => {
    expect(() =>
      $testPath({ route: "/foo/bar", searchParams: { baz: () => void 0 } })
    ).toThrow();
  });
  test("symbol", () => {
    expect(() =>
      $testPath({ route: "/foo/bar", searchParams: { baz: Symbol() } })
    ).toThrow();
  });
  test("bigint", () => {
    expect(() =>
      $testPath({ route: "/foo/bar", searchParams: { baz: BigInt(1) } })
    ).toThrow();
  });
  test("stringified boolean", () => {
    expect(
      $testPath({ route: "/foo/bar", searchParams: { baz: '"true"' } })
    ).toBe("/foo/bar?baz=%22true%22");
  });
  test("stringified number", () => {
    expect($testPath({ route: "/foo/bar", searchParams: { baz: '"1"' } })).toBe(
      "/foo/bar?baz=%221%22"
    );
  });
  test("stringified null", () => {
    expect(
      $testPath({ route: "/foo/bar", searchParams: { baz: '"null"' } })
    ).toBe("/foo/bar?baz=%22null%22");
  });
});

describe("route params", () => {
  test("string", () => {
    expect($testPath({ route: "/foo/[bar]", routeParams: { bar: "hi" } })).toBe(
      "/foo/hi"
    );
  });
  test("number", () => {
    expect($testPath({ route: "/foo/[bar]", routeParams: { bar: 1 } })).toBe(
      "/foo/1"
    );
  });
  test("boolean", () => {
    expect($testPath({ route: "/foo/[bar]", routeParams: { bar: true } })).toBe(
      "/foo/true"
    );
  });
  test("multiple ", () => {
    expect(
      $testPath({
        route: "/foo/[bar]/[baz]",
        routeParams: { bar: "hi", baz: "bye" },
      })
    ).toBe("/foo/hi/bye");
  });
  test("undefined", () => {
    expect(() =>
      $testPath({
        route: "/foo/[bar]",
        routeParams: { bar: undefined },
      })
    ).toThrow();
  });
  test("null", () => {
    expect(
      $testPath({
        route: "/foo/[bar]",
        routeParams: { bar: null },
      })
    ).toBe("/foo/null");
  });
  test("empty string", () => {
    expect(() =>
      $testPath({
        route: "/foo/[bar]",
        routeParams: { bar: "" },
      })
    ).toThrow();
  });
  test("flat array as non catch all", () => {
    expect(
      $testPath({ route: "/foo/[bar]", routeParams: { bar: ["hi", "bye"] } })
    ).toBe("/foo/%5B%22hi%22%2C%22bye%22%5D");
  });
  test("flat object", () => {
    expect(
      $testPath({
        route: "/foo/[bar]",
        routeParams: { bar: { hi: "bye", bye: "hi" } },
      })
    ).toBe("/foo/%7B%22hi%22%3A%22bye%22%2C%22bye%22%3A%22hi%22%7D");
  });
  test("nested array", () => {
    expect(
      $testPath({
        route: "/foo/[bar]",
        routeParams: { bar: [["hi"], ["bye"]] },
      })
    ).toBe("/foo/%5B%5B%22hi%22%5D%2C%5B%22bye%22%5D%5D");
  });
  test("nested object as non catch all", () => {
    expect(
      $testPath({
        route: "/foo/[bar]",
        routeParams: { bar: { hi: { bye: "hi" }, bye: { hi: "bye" } } },
      })
    ).toBe(
      "/foo/%7B%22hi%22%3A%7B%22bye%22%3A%22hi%22%7D%2C%22bye%22%3A%7B%22hi%22%3A%22bye%22%7D%7D"
    );
  });
  test("catch all", () => {
    expect(
      $testPath({
        route: "/foo/[...bar]",
        routeParams: { bar: ["hi", "bye"] },
      })
    ).toBe("/foo/hi/bye");
  });
  test("optional catch all", () => {
    expect(
      $testPath({
        route: "/foo/[[...bar]]",
        routeParams: { bar: ["hi", "bye"] },
      })
    ).toBe("/foo/hi/bye");
  });
  test("optional catch all with undefined", () => {
    expect(
      $testPath({
        route: "/foo/[[...bar]]",
        routeParams: { bar: undefined },
      })
    ).toBe("/foo");
  });
  test("optional catch all with null", () => {
    expect(
      $testPath({
        route: "/foo/[[...bar]]",
        routeParams: { bar: null },
      })
    ).toBe("/foo/null");
  });
  test("optional catch all with empty string", () => {
    expect(() =>
      $testPath({
        route: "/foo/[[...bar]]",
        routeParams: { bar: "" },
      })
    ).toThrow();
  });
  test("function", () => {
    expect(() =>
      $testPath({ route: "/foo/[bar]", routeParams: { bar: () => void 0 } })
    ).toThrow();
  });
  test("symbol", () => {
    expect(() =>
      $testPath({ route: "/foo/[bar]", routeParams: { bar: Symbol() } })
    ).toThrow();
  });
  test("bigint", () => {
    expect(() =>
      $testPath({ route: "/foo/[bar]", routeParams: { bar: BigInt(1) } })
    ).toThrow();
  });
  test("stringified boolean", () => {
    expect(
      $testPath({ route: "/foo/[bar]", routeParams: { bar: '"true"' } })
    ).toBe("/foo/%22true%22");
  });
  test("stringified number", () => {
    expect(
      $testPath({ route: "/foo/[bar]", routeParams: { bar: '"1"' } })
    ).toBe("/foo/%221%22");
  });
  test("stringified null", () => {
    expect(
      $testPath({ route: "/foo/[bar]", routeParams: { bar: '"null"' } })
    ).toBe("/foo/%22null%22");
  });
});

describe("example use cases", () => {
  test("example 1", () => {
    expect(
      $testPath({
        route: "/foo/[bar]/hello/[baz]/[[...qux]]",
        routeParams: { bar: true, baz: 65, qux: [null, "goodbye"] },
      })
    ).toBe("/foo/true/hello/65/null/goodbye");
  });
  test("example 2", () => {
    expect(
      $testPath({
        route: "/product/[productID]",
        routeParams: { productID: 23 },
        searchParams: { userInfo: { name: "bob", age: 23 } },
      })
    ).toBe(
      "/product/23?userInfo=%7B%22name%22%3A%22bob%22%2C%22age%22%3A23%7D"
    );
  });
});
