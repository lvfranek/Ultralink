"use client";

import type { ReactNode } from "react";
import { Nav } from "./nav";
import { Footer } from "./footer";
import s from "./landing.module.css";

/** Shared frame for the marketing pages: dark canvas, grain, floating nav and footer. */
export function SiteShell({ home = false, children }: { home?: boolean; children: ReactNode }) {
  return (
    <div className={s.root}>
      <div className={s.noise} aria-hidden="true" />
      <Nav home={home} />
      {children}
      <Footer home={home} />
    </div>
  );
}
