-- Social links were saved without normalizing the URL, so entries typed
-- without a scheme (e.g. "instagram.com/user") render as a link relative
-- to the current page instead of an absolute URL. Backfill existing rows;
-- app/actions/socials.ts now normalizes on every future save.
update public.page_socials
set url = 'https://' || url
where url !~* '^https?://';
