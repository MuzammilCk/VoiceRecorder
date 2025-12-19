-- Create a table for recordings
create table public.recordings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users, -- Nullable for anonymous usage in Level 2b 
  -- Simplified:
  name text not null,
  duration integer not null, -- seconds
  timestamp timestamptz default now(),
  transcript text,
  audio_url text, -- Store the Storage Public URL or Path
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.recordings enable row level security;

-- Policy: Allow public read/write if we want a simplistic demo (NOT RECOMMENDED for prod)
-- BETTER: Allow anon insert/select for now.
create policy "Allow generic access"
on public.recordings
for all
using (true)
with check (true);

-- Storage Bucket
insert into storage.buckets (id, name, public) 
values ('recordings', 'recordings', true);

-- Storage Policy
create policy "Public Access"
on storage.objects for all
using ( bucket_id = 'recordings' )
with check ( bucket_id = 'recordings' );
