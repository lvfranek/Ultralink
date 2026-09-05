-- Thumbnail image feature removed from link buttons — the icon field already
-- covers the "small visual on a link" use case, so this second image slot
-- was redundant.
alter table public.page_links
  drop column if exists thumbnail_url;
