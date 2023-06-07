function encodeValue(value: unknown): string {
  if (typeof value === "string" && value !== "") {
    return encodeURIComponent(value);
  } else if (typeof value === "number" || typeof value === "boolean") {
    return encodeURIComponent(value.toString());
  } else if (Array.isArray(value) || typeof value === "object") {
    return encodeURIComponent(JSON.stringify(value));
  } else {
    throw new Error("only string, number, boolean, array, and object allowed");
  }
}

export function encodeRouteParamsToObj(
  obj: Record<string, unknown>
): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      params[key] = value.map((item) => encodeValue(item));
    } else {
      const encodedValue = encodeValue(value);
      params[key] = encodedValue;
    }
  }
  return params;
}

export function generateParamStringFromSearchParamObj(
  obj: Record<string, unknown>
): string {
  const params: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const encodedValue = encodeValue(value);
    if (encodedValue !== null) {
      params.push(`${key}=${encodedValue}`);
    }
  }

  const finalString = `?${params.join("&")}`;
  return finalString === "?" ? "" : finalString;
}

function safeJSONParse(value: string | undefined): unknown {
  if (value === undefined) {
    return value;
  }
  try {
    return JSON.parse(decodeURIComponent(value));
  } catch {
    return value;
  }
}

function parseOrMapParse(
  obj: string | string[] | undefined
): unknown | unknown[] {
  if (Array.isArray(obj)) {
    return obj.map(safeJSONParse);
  } else {
    return safeJSONParse(obj);
  }
}

function parseTopLevelObject(
  obj: Record<string, string | string[] | undefined>
): Record<string, unknown | unknown[]> {
  const result: Record<string, unknown | unknown[]> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = parseOrMapParse(value);
  }
  return result;
}

function handleSearchParamMultipleKeys(
  urlParams: URLSearchParams | ReadonlyURLSearchParams
): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};

  urlParams.forEach((value, key) => {
    const valueAtKey = result[key];
    if (Array.isArray(valueAtKey)) {
      valueAtKey.push(value);
    } else if (valueAtKey) {
      result[key] = [valueAtKey, value];
    } else {
      result[key] = value;
    }
  });

  return result;
}

export function parseObjectFromParamString(
  paramString: string
): Record<string, unknown> {
  const params = new URLSearchParams(paramString);
  const handledParams = handleSearchParamMultipleKeys(params);
  return parseTopLevelObject(handledParams);
}

export function parseObjectFromReadonlyURLParams(
  params: ReadonlyURLSearchParams
): Record<string, unknown> {
  const handledParams = handleSearchParamMultipleKeys(params);
  return parseTopLevelObject(handledParams);
}

export function parseObjectFromUseParams(
  params: ReturnType<typeof useParams>
): Record<string, unknown> {
  return parseTopLevelObject(params);
}

import type { NextRouter } from "next/router";

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

function parseSegment(segment: string): Segment {
  if (
    segment.startsWith("[") &&
    segment.endsWith("]") &&
    !segment.includes("...")
  ) {
    return {
      type: "dynamic",
      value: segment.slice(1, -1),
    };
  } else if (
    segment.startsWith("[[") &&
    segment.endsWith("]]") &&
    segment.includes("...")
  ) {
    return {
      type: "optionalCatchAll",
      value: segment.slice(5, -2),
    };
  } else if (
    segment.startsWith("[") &&
    segment.endsWith("]") &&
    segment.includes("...")
  ) {
    return {
      type: "catchAll",
      value: segment.slice(4, -1),
    };
  } else {
    return {
      type: "static",
      value: segment,
    };
  }
}

export function fillPath(
  path: string,
  data: Record<string, string | string[]>
): string {
  const segments = path.split("/");
  const parsed = segments.map((e) => parseSegment(e));
  const parts: string[] = [];

  for (const segment of parsed) {
    if (segment.type === "static") {
      parts.push(segment.value);
    } else if (segment.type === "dynamic") {
      const paramName = segment.value;
      const paramValue = data[paramName];
      if (paramValue !== undefined) {
        parts.push(String(paramValue));
      } else {
        throw new Error(`Missing value for dynamic segment "${segment.value}"`);
      }
    } else if (segment.type === "catchAll") {
      const paramName = segment.value;
      const paramValue = data[paramName];
      if (Array.isArray(paramValue)) {
        parts.push(...paramValue.map((e) => String(e)));
      } else if (paramValue !== undefined) {
        parts.push(String(paramValue));
      } else {
        throw new Error(
          `Missing value for catch-all segment "${segment.value}"`
        );
      }
    } else if (segment.type === "optionalCatchAll") {
      const paramName = segment.value;
      const paramValue = data[paramName];
      if (Array.isArray(paramValue)) {
        parts.push(...paramValue.map((e) => String(e)));
      } else if (paramValue !== undefined) {
        parts.push(String(paramValue));
      }
    }
  }

  return parts.join("/");
}

import { z } from "zod";
import type { ServerParseParamsResult } from "./types";
import { ReadonlyURLSearchParams, useParams } from "next/navigation";
import type { GetServerSidePropsContext } from "next";

// takes gssp context.query
export function parseServerSideSearchParams<T extends z.AnyZodObject>({
  query,
  validator,
}: {
  query: GetServerSidePropsContext["query"];
  validator: T;
}): ServerParseParamsResult<T> {
  const parsedParams = parseTopLevelObject(query);
  const validatedDynamicSearchParams = validator.safeParse(parsedParams);
  if (validatedDynamicSearchParams.success) {
    return {
      data: validatedDynamicSearchParams.data,
      isError: false,
      error: undefined,
    };
  } else {
    return {
      data: undefined,
      isError: true,
      error: validatedDynamicSearchParams.error,
    };
  }
}

// takes gssp context.params
export function parseServerSideRouteParams<T extends z.AnyZodObject>({
  params,
  validator,
}: {
  params: GetServerSidePropsContext["params"];
  validator: T;
}): ServerParseParamsResult<T> {
  if (!params) {
    return {
      data: undefined,
      isError: true,
      error: new z.ZodError([
        {
          path: [],
          code: "custom",
          message: "Params field of gSSP context is undefined",
        },
      ]),
    };
  }

  const parsedParams = parseTopLevelObject(params);
  const validatedDynamicRouteParams = validator.safeParse(parsedParams);
  if (validatedDynamicRouteParams.success) {
    return {
      data: validatedDynamicRouteParams.data,
      isError: false,
      error: undefined,
    };
  } else {
    return {
      data: undefined,
      isError: true,
      error: validatedDynamicRouteParams.error,
    };
  }
}
