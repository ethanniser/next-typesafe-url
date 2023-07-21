import { ReadonlyURLSearchParams, useParams } from "next/navigation";
import type { NextRouter } from "next/router";

// * TESTED
/**
 * Encodes a value to be used in a URL. If the value is a object or array, it is first stringified.
 *
 * @throws If the value is not a non-empty string, number, boolean, array, object, or null.
 */
export function encodeValue(value: unknown): string {
  if (typeof value === "string" && value !== "") {
    // if its a non-empty string, uri encode it
    return encodeURIComponent(value);
  } else if (typeof value === "number" || typeof value === "boolean") {
    // if its a number or boolean, uri encode it after converting it to a string
    return encodeURIComponent(value.toString());
  } else if (
    Array.isArray(value) ||
    typeof value === "object" ||
    value === null
  ) {
    // if its an array, object, or null uri encode it after json stringifying it
    return encodeURIComponent(JSON.stringify(value));
  } else {
    // if its anything else, throw
    throw new Error(
      "only null, non-empty string, number, boolean, array, and object are able to be encoded"
    );
  }
}

// * TESTED
/**
 * Takes an object and returns a string of search params.
 * If a value is undefined or an empty string, it is encoded as a key without a value.
 * If a value is anything else, it is encoded as a key-value pair.
 * If the object is empty, returns an empty string.
 * @throws If the any value in the object is not a non-empty string, number, boolean, array, object, or null.
 *
 * @example generateSearchParamStringFromObj({ foo: "bar", baz: "lux" }) -> "?foo=bar&baz=lux"
 * @example generateSearchParamStringFromObj({ foo: undefined, baz: "lux" }) -> "?foo&baz=lux"
 * @example generateSearchParamStringFromObj({ foo: "", baz: "lux" }) -> "?foo&baz=lux"
 * @example generateSearchParamStringFromObj({}) -> ""
 *
 */
export function generateSearchParamStringFromObj(
  obj: Record<string, unknown>
): string {
  // array to collect the encoded params
  const params: string[] = [];

  // loop over the object
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === "") {
      // if the value is undefined or an empty string, encode the key without a value
      params.push(key);
    } else {
      // if the value is anything else, encode the key-value pair
      params.push(`${key}=${encodeValue(value)}`);
    }
  }
  // join the params with an ampersand
  const finalString = `?${params.join("&")}`;
  // if the string is just a question mark (original object was empty), return an empty string
  return finalString === "?" ? "" : finalString;
}

// * TESTED
/**
 * If a string, first uri decodes the value, then tries to parse it as JSON. If it fails, returns the original value.
 * If undefined, returns undefined.
 */
export function decodeAndTryJSONParse(value: string | undefined): unknown {
  if (value === undefined) {
    return value;
  }
  try {
    return JSON.parse(decodeURIComponent(value));
  } catch {
    return value;
  }
}

// * TESTED
/**
 * If passed an array, maps over it and calls decodeAndTryJSONParse on each item.
 * If passed a string, calls decodeAndTryJSONParse on it.
 */
export function parseOrMapParse(
  obj: string | string[] | undefined
): unknown | unknown[] {
  if (Array.isArray(obj)) {
    return obj.map(decodeAndTryJSONParse);
  } else {
    return decodeAndTryJSONParse(obj);
  }
}

// * TESTED
/**
 * Maps over the object, calling parseOrMapParse on each value.
 */
export function parseMapObject(
  obj: Record<string, string | string[] | undefined>
): Record<string, unknown | unknown[]> {
  const result: Record<string, unknown | unknown[]> = {};

  for (const [key, value] of Object.entries(obj)) {
    result[key] = parseOrMapParse(value);
  }
  return result;
}

// * TESTED
/**
 * Takes a URLSearchParams object and returns a object of the keys and values in the URLSearchParams.
 * If a key has multiple values, the value is transformed to an array of the values.
 * If a key does not have a value, and that is the only instance of the key, the value is set to undefined.
 * If a key does not have a value, and that is not the only instance of the key, is it as if that instance of the key does not exist.
 *
 * @example handleSearchParamMultipleKeys(new URLSearchParams("?foo=bar&baz=flux&baz=corge")) -> { foo: "bar", baz: ["flux", "corge"] }
 * @example handleSearchParamMultipleKeys(new URLSearchParams("?foo=bar&baz")) -> { foo: "bar", baz: undefined }
 * @example handleSearchParamMultipleKeys(new URLSearchParams("?foo=bar&baz&baz=lux")) -> { foo: "bar", baz: "lux" }
 * @example handleSearchParamMultipleKeys(new URLSearchParams("?foo=bar&baz&baz=lux&baz=flux")) -> { foo: "bar", baz: ["lux", "flux"] }
 */
export function handleSearchParamMultipleKeys(
  urlParams: URLSearchParams | ReadonlyURLSearchParams
): Record<string, string | string[] | undefined> {
  const result: Record<string, string | string[] | undefined> = {};

  urlParams.forEach((rawValue, key) => {
    // if a key has no value, URLSearchParams sets the value to an empty string
    // if this is the case, set the value to undefined
    const value = rawValue === "" ? undefined : rawValue;

    const valueAtKey = result[key];

    if (Array.isArray(valueAtKey)) {
      if (value) {
        // if the value in result is an array already, push the value if its not undefined
        valueAtKey.push(value);
      }
    } else if (valueAtKey) {
      // if there is a value and it is not an array, make it an array and push the value if its not undefined
      if (value) {
        result[key] = [valueAtKey, value];
      }
    } else {
      // if there is no value, set the value
      result[key] = value;
    }
  });

  return result;
}

// * TESTED
/**
 * Takes a raw search string and returns a object of the keys and parsed values
 *
 * @example parseObjectFromParamString("?foo=true&baz=56&bar=hello") -> { foo: true, baz: 56, bar: "hello" }
 */
export function parseObjectFromParamString(
  paramString: string
): Record<string, unknown> {
  const params = new URLSearchParams(paramString);
  const handledParams = handleSearchParamMultipleKeys(params);
  return parseMapObject(handledParams);
}

export function parseObjectFromReadonlyURLParams(
  params: ReadonlyURLSearchParams
): Record<string, unknown> {
  const handledParams = handleSearchParamMultipleKeys(params);
  return parseMapObject(handledParams);
}

export function parseObjectFromUseParams(
  params: ReturnType<typeof useParams>
): Record<string, unknown> {
  return parseMapObject(params);
}

export function getDynamicRouteParams(
  path: NextRouter["route"],
  query: NextRouter["query"]
): Record<string, unknown> {
  const segments = path.split("/");

  // Extract dynamic segments from the path
  const dynamicSegments = segments.filter(
    (segment) =>
      segment.startsWith("[") &&
      segment.endsWith("]") &&
      !segment.includes("...")
  );
  const optionalCatchAllSegments = segments.filter(
    (segment) =>
      segment.startsWith("[[") &&
      segment.endsWith("]]") &&
      segment.includes("...")
  );
  const catchAllSegments = segments.filter(
    (segment) =>
      segment.startsWith("[") &&
      segment.endsWith("]") &&
      segment.includes("...")
  );
  // Extract dynamic param names from dynamic segments
  const dynamicParamNames = dynamicSegments.map((segment) =>
    segment.slice(1, -1)
  );

  const optionalCatchAllParamNames = optionalCatchAllSegments.map((segment) =>
    segment.slice(5, -2)
  );

  const catchAllParamNames = catchAllSegments.map((segment) =>
    segment.slice(4, -1)
  );

  const allCatchAllNames = [
    ...optionalCatchAllParamNames,
    ...catchAllParamNames,
  ];

  const parsedCatchAll: Record<string, unknown[]> = {};

  for (const name of allCatchAllNames) {
    const value = query[name];
    const result = parseOrMapParse(value);
    parsedCatchAll[name] = Array.isArray(result) ? result : [result];
  }

  const parsedNonCatchAll: Record<string, unknown> = {};

  for (const name of dynamicParamNames) {
    const value = query[name];
    parsedNonCatchAll[name] = parseOrMapParse(value);
  }

  return { ...parsedNonCatchAll, ...parsedCatchAll };
}

type Segment = {
  type: "static" | "dynamic" | "catchAll" | "optionalCatchAll";
  value: string;
};

// * TESTED
/**
 * Takes a segment of a route and returns an object with the type of segment and the value of the segment.
 *
 * @example parseSegment("foo") -> { type: "static", value: "foo"}
 * @example parseSegment("[bar]") -> { type: "dynamic", value: "bar"}
 * @example parseSegment("[...baz]") -> { type: "catchAll", value: "baz"}
 * @example parseSegment("[[...lux]]") -> { type: "optionalCatchAll", value: "lux"}
 */
export function parseSegment(segment: string): Segment {
  if (
    segment.startsWith("[") &&
    segment.endsWith("]") &&
    !segment.includes("...")
  ) {
    // dynamic segment ie [id] -> { type: "dynamic", value: "id"}
    return {
      type: "dynamic",
      value: segment.slice(1, -1),
    };
  } else if (
    segment.startsWith("[[") &&
    segment.endsWith("]]") &&
    segment.includes("...")
  ) {
    // optional catch-all segment ie [[...id]] -> { type: "optionalCatchAll", value: "id"}
    return {
      type: "optionalCatchAll",
      value: segment.slice(5, -2),
    };
  } else if (
    segment.startsWith("[") &&
    segment.endsWith("]") &&
    segment.includes("...")
  ) {
    // catch-all segment ie [...id] -> { type: "catchAll", value: "id"}
    return {
      type: "catchAll",
      value: segment.slice(4, -1),
    };
  } else {
    // static segment ie "foo" -> { type: "static", value: "foo"}
    return {
      type: "static",
      value: segment,
    };
  }
}

// * TESTED
/**
 * Takes a route and a object, filling the dynamic segments with the corresponding values from the object after encoding them.
 *
 * @throws If a dynamic segment or catch-all segment in the route does not have a corresponding value in routeParams.
 *
 * @example encodeAndFillRoute("/foo/[bar]/[...baz]", { bar: "lux", baz: ["flux", "corge"] }) -> "/foo/lux/flux/corge"
 */
export function encodeAndFillRoute(
  route: string,
  routeParams: Record<string, unknown>
): string {
  // split the route into its segments
  const segments = route.split("/");
  // parse each segment to a Segment object
  const parsed = segments.map((e) => parseSegment(e));
  // the array to collect the encoded and filled segments
  const parts: string[] = [];

  for (const segment of parsed) {
    if (segment.type === "static") {
      // static segment so just push the value
      parts.push(segment.value);
    } else if (segment.type === "dynamic") {
      // dynamic segment so get the value from the routeParams, encode it, and push it
      // if it's undefined, throw
      const paramValue = routeParams[segment.value];
      if (paramValue !== undefined) {
        parts.push(encodeValue(paramValue));
      } else {
        throw new Error(`Missing value for dynamic segment "${segment.value}"`);
      }
    } else if (segment.type === "catchAll") {
      // catch-all segment so get the value from the routeParams,
      // if its not an array, encode and push
      // if its an array, encode each item and push
      // if its undefined, throw
      const paramValue = routeParams[segment.value];
      if (Array.isArray(paramValue)) {
        parts.push(...paramValue.map((e) => encodeValue(e)));
      } else if (paramValue !== undefined) {
        parts.push(encodeValue(paramValue));
      } else {
        throw new Error(
          `Missing value for catch-all segment "${segment.value}"`
        );
      }
    } else if (segment.type === "optionalCatchAll") {
      // optional catch-all segment so get the value from the routeParams,
      // if its not an array, encode and push
      // if its an array, encode each item and push
      // if its undefined don't push anything

      const paramValue = routeParams[segment.value];
      if (Array.isArray(paramValue)) {
        parts.push(...paramValue.map((e) => encodeValue(e)));
      } else if (paramValue !== undefined) {
        parts.push(encodeValue(paramValue));
      }
    }
  }

  // join the parts with a slash
  return parts.join("/");
}
