"use client";

import { useState } from "react";
import type { Page, PageLink, PageSocial } from "@/lib/supabase/types";
import { draftFromPage } from "./draft";
import { PageEditor, type EditorTab } from "./page-editor";

/**
 * Keeps the open tab while the editor itself remounts on freshly saved data
 * (keyed by the page's updated_at), so saving never leaves stale state behind.
 */
export function EditorRoot({
  page,
  links,
  socials,
  ...rest
}: {
  page: Page;
  links: PageLink[];
  socials: PageSocial[];
  siteUrl: string;
  userId: string;
  pro: boolean;
  clicks: Record<string, number> | null;
}) {
  const [tab, setTab] = useState<EditorTab>("content");
  return (
    <PageEditor
      key={page.updated_at}
      pageId={page.id}
      slug={page.slug}
      initial={draftFromPage(page, links, socials)}
      tab={tab}
      onTab={setTab}
      {...rest}
    />
  );
}
