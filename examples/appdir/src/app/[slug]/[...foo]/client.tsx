"use client";

import { $path } from "next-typesafe-url";
import Link from "next/link";


export const Client = () => {

  return (
    <>
      <Link href={$path({ route: "/" })}>Back</Link>
    </>
  );
};
