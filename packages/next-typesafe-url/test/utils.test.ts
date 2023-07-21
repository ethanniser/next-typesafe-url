import { describe, expect, test } from "vitest";
import {
  parseSegment,
  encodeAndFillRoute,
  encodeValue,
  safeJSONParse,
} from "../src/utils";

describe("parseSegment", () => {
  test("static segment", () => {
    expect(parseSegment("foo")).toEqual({ type: "static", value: "foo" });
  });
  test("dynamic segment", () => {
    expect(parseSegment("[foo]")).toEqual({ type: "dynamic", value: "foo" });
  });
  test("catch all segment", () => {
    expect(parseSegment("[...foo]")).toEqual({
      type: "catchAll",
      value: "foo",
    });
  });
  test("optional catch all segment", () => {
    expect(parseSegment("[[...foo]]")).toEqual({
      type: "optionalCatchAll",
      value: "foo",
    });
  });
});

describe("encodeAndFillRoute", () => {
  test("static route", () => {
    expect(encodeAndFillRoute("/foo/bar", {})).toBe("/foo/bar");
  });
  test("simple dynamic route", () => {
    expect(encodeAndFillRoute("/foo/[bar]", { bar: "baz" })).toBe("/foo/baz");
  });
  test("dynamic route with multiple segments", () => {
    expect(
      encodeAndFillRoute("/foo/[bar]/[baz]", { bar: "baz", baz: "qux" })
    ).toBe("/foo/baz/qux");
  });
  test("catch all route- not array passed", () => {
    expect(encodeAndFillRoute("/foo/[...bar]", { bar: "baz" })).toBe(
      "/foo/baz"
    );
  });
  test("catch all route- array passed", () => {
    expect(encodeAndFillRoute("/foo/[...bar]", { bar: ["baz", "qux"] })).toBe(
      "/foo/baz/qux"
    );
  });
  test("optional catch all route- undefined", () => {
    expect(encodeAndFillRoute("/foo/[[...bar]]", { bar: undefined })).toBe(
      "/foo"
    );
  });
  test("optional catch all route- not array passed", () => {
    expect(encodeAndFillRoute("/foo/[[...bar]]", { bar: "baz" })).toBe(
      "/foo/baz"
    );
  });
  test("optional catch all route- array passed", () => {
    expect(encodeAndFillRoute("/foo/[[...bar]]", { bar: ["baz", "qux"] })).toBe(
      "/foo/baz/qux"
    );
  });
  test("missing dynamic segment", () => {
    expect(() => encodeAndFillRoute("/foo/[bar]", {})).toThrow();
  });
  test("missing catch all segment", () => {
    expect(() => encodeAndFillRoute("/foo/[...bar]", {})).toThrow();
  });
  test("missing optional catch all segment", () => {
    expect(encodeAndFillRoute("/foo/[[...bar]]", {})).toBe("/foo");
  });
});

describe("encodeValue", () => {
  test("string", () => {
    expect(
      encodeValue(
        "Hello, this is a string with special characters like !@#$%^&*()_-+=[]{}|;:'\",.<>?/ and spaces."
      )
    ).toBe(
      encodeURIComponent(
        "Hello, this is a string with special characters like !@#$%^&*()_-+=[]{}|;:'\",.<>?/ and spaces."
      )
    );
  });
  test("number", () => {
    expect(encodeValue(1)).toBe("1");
  });
  test("boolean", () => {
    expect(encodeValue(true)).toBe("true");
  });
  test("null", () => {
    expect(encodeValue(null)).toBe("null");
  });
  test("array", () => {
    expect(encodeValue(["foo"])).toBe(
      encodeURIComponent(JSON.stringify(["foo"]))
    );
  });
  test("object", () => {
    expect(encodeValue({ foo: "bar" })).toBe(
      encodeURIComponent(JSON.stringify({ foo: "bar" }))
    );
  });
  test("undefined", () => {
    expect(() => encodeValue(undefined)).toThrow();
  });
  test("empty string", () => {
    expect(() => encodeValue("")).toThrow();
  });
  test("function", () => {
    expect(() => encodeValue(() => void 0)).toThrow();
  });
  test("symbol", () => {
    expect(() => encodeValue(Symbol())).toThrow();
  });
  test("bigint", () => {
    expect(() => encodeValue(BigInt(1))).toThrow();
  });
});

describe("safeJSONParse", () => {
  test("string", () => {
    expect(safeJSONParse('"foo"')).toBe("foo");
  });
  test("number", () => {
    expect(safeJSONParse("1")).toBe(1);
  });
  test("boolean", () => {
    expect(safeJSONParse("true")).toBe(true);
  });
  test("null", () => {
    expect(safeJSONParse("null")).toBe(null);
  });
  test("array", () => {
    expect(safeJSONParse('["foo"]')).toEqual(["foo"]);
  });
  test("object", () => {
    expect(safeJSONParse('{"foo":"bar"}')).toEqual({ foo: "bar" });
  });
  test("undefined as string", () => {
    expect(safeJSONParse("undefined")).toBe("undefined");
  });
  test("undefined as undefined", () => {
    expect(safeJSONParse(undefined)).toBe(undefined);
  });
  test("empty string", () => {
    expect(safeJSONParse("")).toBe("");
  });
});
