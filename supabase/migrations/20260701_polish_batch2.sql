-- Polish batch 2 migration
-- Run this in the Supabase SQL editor

-- page_links: support heading (section divider) items alongside buttons
alter table public.page_links
  add column if not exists item_type text not null default 'button'
    check (item_type in ('button', 'heading'));

-- For heading items, `label` holds the heading text; `url` is empty and ignored.
-- Style fields (fill_type, fill_value, text_color, corner, animation, is_adult)
-- are ignored for headings.
