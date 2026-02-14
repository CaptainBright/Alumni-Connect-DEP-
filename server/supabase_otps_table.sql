-- Create a table to store OTPs
create table public.otps (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  otp text not null,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '5 minutes')
);

-- Enable Row Level Security (RLS)
alter table public.otps enable row level security;

-- Create a policy that allows the service role (backend) to do everything
-- Note: The service role bypasses RLS by default, but it's good practice to be explicit if needed.
-- But for Client access (if any), we should block it. 
-- Since we are only accessing this from the Node.js backend using the Service Role Key, 
-- we don't strictly need permissive policies for 'anon' or 'authenticated'.
-- In fact, we should probaby DENY all access to public to prevent token scraping.

create policy "Deny public access"
  on public.otps
  for all
  using (false); 

-- The backend uses the SERVICE_ROLE_KEY which bypasses RLS, so it will still work.
