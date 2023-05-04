"use client";

import { $path } from "next-typesafe-url";
import Link from "next/link";

export const ClientLink = () => <Link href={$path({ route: "/" })}>Back</Link>;
