-- Storage setup for Phase 2B
-- Step 1: In the Supabase dashboard → Storage, create a bucket named "media"
--         Set it to PUBLIC.
--
-- Step 2: Run these SQL policies in the Supabase SQL editor.
--         (Storage → Policies tab, or just paste in the SQL editor)

-- Anyone can read from the media bucket
create policy "media_public_read"
  on storage.objects for select
  using (bucket_id = 'media');

-- Authenticated users can upload files inside their own uid folder
create policy "media_owner_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'media'
    and auth.role() = 'authenticated'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Authenticated users can update their own files
create policy "media_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'media'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Authenticated users can delete their own files
create policy "media_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'media'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );
