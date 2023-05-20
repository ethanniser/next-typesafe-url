export function generateParamStringFromObject(
  obj: Record<string, unknown>
): string {
  const params: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string" && value !== "") {
      params.push(`${key}=${encodeURIComponent(value)}`);
    } else if (typeof value === "number" || typeof value === "boolean") {
      params.push(`${key}=${encodeURIComponent(value.toString())}`);
    } else if (Array.isArray(value)) {
      params.push(`${key}=${encodeURIComponent(JSON.stringify(value))}`);
    } else if (typeof value === "object") {
      params.push(`${key}=${encodeURIComponent(JSON.stringify(value))}`);
    }
  }
  const finalString = `?${params.join("&")}`;
  return finalString === "?" ? "" : finalString;
}

export function parseObjectFromParamString(
  paramString: string
): Record<string, unknown> {
  const params = new URLSearchParams(paramString);
  const obj: Record<string, unknown> = {};
  for (const [key, value] of params.entries()) {
    let parsedValue: unknown;
    if (value === "true") {
      parsedValue = true;
    } else if (value === "false") {
      parsedValue = false;
    } else if (value === "null") {
      parsedValue = null;
    } else {
      try {
        parsedValue = JSON.parse(value);
      } catch {
        parsedValue = value;
      }
    }
    obj[key] = parsedValue;
  }
  return obj;
}

export function parseObjectFromURLParamObj(
  params: ReadonlyURLSearchParams
): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value] of params.entries()) {
    let parsedValue: unknown;
    if (value === "true") {
      parsedValue = true;
    } else if (value === "false") {
      parsedValue = false;
    } else if (value === "null") {
      parsedValue = null;
    } else {
      try {
        parsedValue = JSON.parse(value);
      } catch {
        parsedValue = value;
      }
    }
    obj[key] = parsedValue;
  }
  return obj;
}

export function parseObjectFromParamObj(
  params: Params
): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [key, value2] of Object.entries(params)) {
    let value = (value2 as string).split("/");
    let parsedValue: unknown;
    if (value.length > 1) {
      parsedValue = value.map((e) => reservedParse(e));
    } else {
      parsedValue = reservedParse(value[0]!);
    }
    obj[key] = parsedValue;
  }
  return obj;
}

type Query = {
  [key: string]: string | string[] | undefined;
};

type DynamicParam2s = {
  [key: string]: unknown;
};

export function getDynamicRouteParams(
  path: string,
  query: Query
): DynamicParam2s {
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
  // Retrieve values of dynamic params from query object
  const dynamicParams: DynamicParam2s = {};
  for (const paramName of allCatchAllNames) {
    const value = query[paramName];
    let parsedValue: unknown;
    if (value === undefined) {
      parsedValue = undefined;
    } else if (Array.isArray(value)) {
      parsedValue = value.map((x) => reservedParse(x));
    } else {
      parsedValue = [reservedParse(value)];
    }
    dynamicParams[paramName] = parsedValue;
  }

  for (const paramName of dynamicParamNames) {
    const value = query[paramName];
    //value should always be string but check anyway
    let parsedValue: unknown;
    if (value === undefined) {
      parsedValue = undefined;
    } else if (Array.isArray(value)) {
      parsedValue = value.map((x) => reservedParse(x));
    } else {
      parsedValue = reservedParse(value);
    }
    dynamicParams[paramName] = parsedValue;
  }

  return dynamicParams;
}

function reservedParse(value: string): unknown {
  let parsedValue: unknown;

  if (value !== undefined) {
    if (value === "true") {
      parsedValue = true;
    } else if (value === "false") {
      parsedValue = false;
    } else if (value === "null") {
      parsedValue = null;
    } else {
      try {
        parsedValue = JSON.parse(value);
      } catch {
        parsedValue = value;
      }
    }
  }
  return parsedValue;
}

export function parse3(value: string | string[] | undefined) {
  let parsedValue: unknown;
  if (value === undefined) {
    parsedValue = undefined;
  } else if (Array.isArray(value)) {
    parsedValue = value.map((x) => parse2(x));
  } else {
    parsedValue = parse2(value);
  }
  return parsedValue;
}

export function parse2(value: string | string[] | undefined) {
  let parsedValue: unknown;
  if (value === undefined) {
    parsedValue = undefined;
  } else if (Array.isArray(value)) {
    parsedValue = value.map((x) => reservedParse(x));
  } else {
    parsedValue = reservedParse(value);
  }
  return parsedValue;
}

type RouteParamsInput = {
  [key: string]: string | number | boolean | (string | number | boolean)[];
};

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

export function fillPath(path: string, data: RouteParamsInput): string {
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

import type { ParsedUrlQuery } from "querystring";
import { z } from "zod";
import type { ServerParseParamsResult } from "./types";
import { ReadonlyURLSearchParams } from "next/navigation";
import { Params } from "next/dist/shared/lib/router/utils/route-matcher";

// takes gssp context.query
export function parseServerSideSearchParams<T extends z.AnyZodObject>({
  query,
  validator,
}: {
  query: ParsedUrlQuery;
  validator: T;
}): ServerParseParamsResult<T> {
  if (!query) {
    return {
      data: undefined,
      isError: true,
      error: new z.ZodError([
        {
          path: [],
          code: "custom",
          message: "No query context found",
        },
      ]),
    };
  }
  const parsedParams = Object.fromEntries(
    Object.entries(query).map(([key, value]) => [key, parse3(value)])
  );

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
      error: validatedDynamicSearchParams.error as z.ZodError,
    };
  }
}

// takes gssp context.params
export function parseServerSideRouteParams<T extends z.AnyZodObject>({
  params,
  validator,
}: {
  params: ParsedUrlQuery | undefined;
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
          message: "No param context found",
        },
      ]),
    };
  }

  const parsedParams = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, parse2(value)])
  );

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
      error: validatedDynamicRouteParams.error as z.ZodError,
    };
  }
}
