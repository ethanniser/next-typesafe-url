import { describe, expect, test } from "vitest";
import {
  parseSegment,
  encodeAndFillRoute,
  encodeValue,
  decodeAndTryJSONParse,
  generateSearchParamStringFromObj,
  parseOrMapParse,
  parseMapObject,
  handleSearchParamMultipleKeys,
  parseObjectFromParamString,
  parseObjectFromStringRecord,
} from "../src/utils";
import { ReadonlyURLSearchParams } from "next/navigation";

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

describe("decodeAndTryJSONParse", () => {
  test("string", () => {
    expect(decodeAndTryJSONParse('"foo"')).toBe("foo");
  });

  test("number", () => {
    expect(decodeAndTryJSONParse("1")).toBe(1);
  });

  test("boolean", () => {
    expect(decodeAndTryJSONParse("true")).toBe(true);
  });

  test("null", () => {
    expect(decodeAndTryJSONParse("null")).toBe(null);
  });

  test("array", () => {
    expect(decodeAndTryJSONParse('["foo"]')).toEqual(["foo"]);
  });

  test("object", () => {
    expect(decodeAndTryJSONParse('{"foo":"bar"}')).toEqual({ foo: "bar" });
  });

  test("undefined as string", () => {
    expect(decodeAndTryJSONParse("undefined")).toBe("undefined");
  });

  test("undefined as undefined", () => {
    expect(decodeAndTryJSONParse(undefined)).toBe(undefined);
  });

  test("empty string", () => {
    expect(decodeAndTryJSONParse("")).toBe("");
  });
});

describe("generateSearchParamStringFromObj", () => {
  test("empty object", () => {
    expect(generateSearchParamStringFromObj({})).toBe("");
  });

  test("single key-value pair", () => {
    expect(generateSearchParamStringFromObj({ foo: "bar" })).toBe("?foo=bar");
  });

  test("multiple key-value pairs", () => {
    expect(generateSearchParamStringFromObj({ foo: [1, 2], baz: true })).toBe(
      "?foo=%5B1%2C2%5D&baz=true"
    );
  });

  test("undefined value", () => {
    expect(generateSearchParamStringFromObj({ foo: undefined })).toBe("?foo");
  });

  test("empty string value", () => {
    expect(generateSearchParamStringFromObj({ foo: "" })).toBe("?foo");
  });

  test("standard use case", () => {
    expect(
      generateSearchParamStringFromObj({
        foo: "bar",
        baz: [1, 2],
        qux: true,
        lux: undefined,
        flux: "",
      })
    ).toBe("?foo=bar&baz=%5B1%2C2%5D&qux=true&lux&flux");
  });
});

describe("parseOrMapParse", () => {
  test("string", () => {
    expect(parseOrMapParse("%5B1%2C2%5D")).toStrictEqual([1, 2]);
  });

  test("array", () => {
    expect(parseOrMapParse(["%5B1%2C2%5D", "%5B1%2C2%5D"])).toStrictEqual([
      [1, 2],
      [1, 2],
    ]);
  });

  test("undefined", () => {
    expect(parseOrMapParse(undefined)).toBe(undefined);
  });
});

describe("parseMapObject", () => {
  test("standard use case", () => {
    expect(
      parseMapObject({
        foo: "foo",
        bar: "%5B1%2C2%5D",
        baz: ["%5B1%2C2%5D", "%5B1%2C2%5D"],
      })
    ).toStrictEqual({
      foo: "foo",
      bar: [1, 2],
      baz: [
        [1, 2],
        [1, 2],
      ],
    });
  });
});

describe("handleSearchParamMultipleKeys", () => {
  test("multiple keys with multiple and single values", () => {
    expect(
      handleSearchParamMultipleKeys(
        new URLSearchParams("?foo=bar&baz=flux&baz=corge")
      )
    ).toStrictEqual({
      foo: "bar",
      baz: ["flux", "corge"],
    });
  });

  test("key without value", () => {
    expect(
      handleSearchParamMultipleKeys(new URLSearchParams("?foo=bar&baz"))
    ).toStrictEqual({
      foo: "bar",
      baz: undefined,
    });
  });

  test("key without value but appearing multiple times", () => {
    expect(
      handleSearchParamMultipleKeys(new URLSearchParams("?foo=bar&baz&baz=lux"))
    ).toStrictEqual({
      foo: "bar",
      baz: "lux",
    });
  });

  test("key without value but appearing multiple times with other keys", () => {
    expect(
      handleSearchParamMultipleKeys(
        new URLSearchParams("?foo=bar&baz&baz=lux&baz=flux")
      )
    ).toStrictEqual({
      foo: "bar",
      baz: ["lux", "flux"],
    });
  });
});

describe("parseObjectFromParamString", () => {
  test("standard use case", () => {
    expect(
      parseObjectFromParamString("?foo=bar&baz=%5B1%2C2%5D&qux=true&lux")
    ).toStrictEqual({
      foo: "bar",
      baz: [1, 2],
      qux: true,
      lux: undefined,
    });
  });
});

describe("parseObjectFromReadonlyURLParams", () => {
  test("multiple keys with multiple and single values", () => {
    expect(
      handleSearchParamMultipleKeys(
        new ReadonlyURLSearchParams(
          new URLSearchParams("?foo=bar&baz=flux&baz=corge")
        )
      )
    ).toStrictEqual({
      foo: "bar",
      baz: ["flux", "corge"],
    });
  });

  test("key without value", () => {
    expect(
      handleSearchParamMultipleKeys(
        new ReadonlyURLSearchParams(new URLSearchParams("?foo=bar&baz"))
      )
    ).toStrictEqual({
      foo: "bar",
      baz: undefined,
    });
  });

  test("key without value but appearing multiple times", () => {
    expect(
      handleSearchParamMultipleKeys(
        new ReadonlyURLSearchParams(new URLSearchParams("?foo=bar&baz&baz=lux"))
      )
    ).toStrictEqual({
      foo: "bar",
      baz: "lux",
    });
  });

  test("key without value but appearing multiple times with other keys", () => {
    expect(
      handleSearchParamMultipleKeys(
        new ReadonlyURLSearchParams(
          new URLSearchParams("?foo=bar&baz&baz=lux&baz=flux")
        )
      )
    ).toStrictEqual({
      foo: "bar",
      baz: ["lux", "flux"],
    });
  });
});

describe("parseObjectFromStringRecord", () => {
  test("standard use case", () => {
    expect(
      parseObjectFromStringRecord({
        foo: "foo",
        bar: "%5B1%2C2%5D",
      })
    ).toStrictEqual({
      foo: "foo",
      bar: [1, 2],
    });
  });
});
