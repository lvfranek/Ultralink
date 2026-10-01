"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { checkSlugAvailable } from "@/app/actions/pages";
import { SiteShell } from "./shell";
import { Hero } from "./hero";
import { Platforms } from "./platforms";
import { Story } from "./story";
import { Bento } from "./bento";
import { Pricing } from "./pricing";
import { Faq } from "./faq";
import { FinalCta } from "./final-cta";
import { useReveal, type SlugCheck } from "./shared";

const INVALID_HINT = "2–30 characters: a–z, 0–9 and -";

export function Landing() {
  const router = useRouter();
  const [check, setCheck] = useState<SlugCheck>({ username: "", state: "idle", error: null });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ignores availability answers for anything but the latest input
  const latestRef = useRef("");
  useReveal();

  const handleUsername = (raw: string) => {
    const username = raw
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 30);
    latestRef.current = username;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (username.length < 2) {
      setCheck({
        username,
        state: username.length === 0 ? "idle" : "unavailable",
        error: username.length === 0 ? null : INVALID_HINT,
      });
      return;
    }

    setCheck({ username, state: "checking", error: null });
    debounceRef.current = setTimeout(async () => {
      const result = await checkSlugAvailable(username);
      if (latestRef.current !== username) return;
      setCheck({
        username,
        state: result.available ? "available" : "unavailable",
        error: result.available ? null : (result.error ?? INVALID_HINT),
      });
    }, 400);
  };

  const handleClaim = () => router.push(`/login?username=${encodeURIComponent(check.username)}`);

  return (
    <SiteShell home>
      <main id="main">
        <Hero check={check} onUsername={handleUsername} onClaim={handleClaim} />
        <Platforms />
        <Story />
        <Bento />
        <Pricing />
        <Faq />
        <FinalCta check={check} onUsername={handleUsername} onClaim={handleClaim} />
      </main>
    </SiteShell>
  );
}
