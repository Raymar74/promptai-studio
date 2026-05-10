-- Create feedback table
create table public.feedback (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) not null,
    type text not null check (type in ('bug', 'idea', 'other')),
    message text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.feedback enable row level security;

-- Only authenticated users can insert their own feedback
create policy "Users can insert their own feedback"
    on public.feedback for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Users can view their own feedback (optional, but good practice)
create policy "Users can view their own feedback"
    on public.feedback for select
    to authenticated
    using (auth.uid() = user_id);

-- Note: The database owner/admin can bypass RLS via the Supabase dashboard to view all feedback.
