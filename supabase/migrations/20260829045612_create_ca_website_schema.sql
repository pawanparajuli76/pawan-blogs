/*
# Create Chartered Accountant Website Schema

Production-ready schema for the CA website with explicit admin controls.
*/

create extension if not exists pgcrypto;

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
      and au.is_active = true
  );
$$;

-- ============ ADMIN USERS ============
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null unique,
  role text not null default 'admin' check (role in ('admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table admin_users enable row level security;

create trigger admin_users_set_updated_at
before update on admin_users
for each row
execute procedure public.handle_updated_at();

drop policy if exists "admin_users_admin_only_select" on admin_users;
create policy "admin_users_admin_only_select" on admin_users
for select to authenticated
using (public.is_admin());

drop policy if exists "admin_users_admin_only_manage" on admin_users;
create policy "admin_users_admin_only_manage" on admin_users
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============ PROFILES ============
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  professional_title text,
  bio text,
  profile_image text,
  email text,
  phone text,
  location text,
  linkedin_url text,
  facebook_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create trigger profiles_set_updated_at
before update on profiles
for each row
execute procedure public.handle_updated_at();

drop policy if exists "public_read_profiles" on profiles;
create policy "public_read_profiles" on profiles
for select to anon, authenticated
using (true);

drop policy if exists "admin_manage_profiles" on profiles;
create policy "admin_manage_profiles" on profiles
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============ CATEGORIES ============
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz default now()
);

alter table categories enable row level security;

drop policy if exists "public_read_categories" on categories;
create policy "public_read_categories" on categories
for select to anon, authenticated
using (true);

drop policy if exists "admin_manage_categories" on categories;
create policy "admin_manage_categories" on categories
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create index if not exists idx_categories_slug on categories(slug);

-- ============ TAGS ============
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz default now()
);

alter table tags enable row level security;

drop policy if exists "public_read_tags" on tags;
create policy "public_read_tags" on tags
for select to anon, authenticated
using (true);

drop policy if exists "admin_manage_tags" on tags;
create policy "admin_manage_tags" on tags
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create index if not exists idx_tags_slug on tags(slug);

-- ============ BLOG POSTS ============
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  featured_image text,
  category_id uuid references categories(id) on delete set null,
  author_id uuid references profiles(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  is_featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  seo_title text,
  seo_description text
);

alter table blog_posts enable row level security;

create trigger blog_posts_set_updated_at
before update on blog_posts
for each row
execute procedure public.handle_updated_at();

drop policy if exists "public_read_published_posts" on blog_posts;
create policy "public_read_published_posts" on blog_posts
for select to anon, authenticated
using (status = 'published');

drop policy if exists "admin_read_all_posts" on blog_posts;
create policy "admin_read_all_posts" on blog_posts
for select to authenticated
using (public.is_admin());

drop policy if exists "admin_manage_posts" on blog_posts;
create policy "admin_manage_posts" on blog_posts
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create index if not exists idx_blog_posts_slug on blog_posts(slug);
create index if not exists idx_blog_posts_status on blog_posts(status);
create index if not exists idx_blog_posts_published_at on blog_posts(published_at desc);
create index if not exists idx_blog_posts_category on blog_posts(category_id);

-- ============ BLOG POST TAGS ============
create table if not exists blog_post_tags (
  post_id uuid not null references blog_posts(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

alter table blog_post_tags enable row level security;

drop policy if exists "public_read_post_tags" on blog_post_tags;
create policy "public_read_post_tags" on blog_post_tags
for select to anon, authenticated
using (
  exists (
    select 1 from blog_posts
    where blog_posts.id = blog_post_tags.post_id
      and blog_posts.status = 'published'
  )
);

drop policy if exists "admin_manage_post_tags" on blog_post_tags;
create policy "admin_manage_post_tags" on blog_post_tags
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============ CONTACT MESSAGES ============
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  created_at timestamptz default now(),
  status text not null default 'new' check (status in ('new', 'read', 'replied'))
);

alter table contact_messages enable row level security;

drop policy if exists "public_insert_contact_messages" on contact_messages;
create policy "public_insert_contact_messages" on contact_messages
for insert to anon, authenticated
with check (true);

drop policy if exists "admin_read_contact_messages" on contact_messages;
create policy "admin_read_contact_messages" on contact_messages
for select to authenticated
using (public.is_admin());

drop policy if exists "admin_manage_contact_messages" on contact_messages;
create policy "admin_manage_contact_messages" on contact_messages
for update, delete to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============ RESOURCES ============
create table if not exists resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  file_url text,
  category text,
  created_at timestamptz default now(),
  status text not null default 'published' check (status in ('draft', 'published'))
);

alter table resources enable row level security;

drop policy if exists "public_read_published_resources" on resources;
create policy "public_read_published_resources" on resources
for select to anon, authenticated
using (status = 'published');

drop policy if exists "admin_read_all_resources" on resources;
create policy "admin_read_all_resources" on resources
for select to authenticated
using (public.is_admin());

drop policy if exists "admin_manage_resources" on resources;
create policy "admin_manage_resources" on resources
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============ STORAGE POLICIES ============
-- Create these buckets in Supabase Dashboard: blog-images, profile-images, resources.
-- All three should be public buckets so public users can read the files that are published.

-- blog-images
create policy "blog_images_public_read" on storage.objects
for select to anon, authenticated
using (bucket_id = 'blog-images');

create policy "blog_images_admin_write" on storage.objects
for insert, update, delete to authenticated
with check (bucket_id = 'blog-images' and public.is_admin());

create policy "blog_images_admin_update" on storage.objects
for update to authenticated
using (bucket_id = 'blog-images' and public.is_admin())
with check (bucket_id = 'blog-images' and public.is_admin());

create policy "blog_images_admin_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'blog-images' and public.is_admin());

-- profile-images
create policy "profile_images_public_read" on storage.objects
for select to anon, authenticated
using (bucket_id = 'profile-images');

create policy "profile_images_admin_write" on storage.objects
for insert, update, delete to authenticated
with check (bucket_id = 'profile-images' and public.is_admin());

create policy "profile_images_admin_update" on storage.objects
for update to authenticated
using (bucket_id = 'profile-images' and public.is_admin())
with check (bucket_id = 'profile-images' and public.is_admin());

create policy "profile_images_admin_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'profile-images' and public.is_admin());

-- resources
create policy "resources_public_read" on storage.objects
for select to anon, authenticated
using (bucket_id = 'resources');

create policy "resources_admin_write" on storage.objects
for insert, update, delete to authenticated
with check (bucket_id = 'resources' and public.is_admin());

create policy "resources_admin_update" on storage.objects
for update to authenticated
using (bucket_id = 'resources' and public.is_admin())
with check (bucket_id = 'resources' and public.is_admin());

create policy "resources_admin_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'resources' and public.is_admin());

-- Seed the main profile record only after the admin user exists
-- replace with your real admin user email if needed
-- insert into public.admin_users (user_id, email, role, is_active)
-- select id, email, 'admin', true
-- from auth.users
-- where email = 'admin@example.com'
-- on conflict (email) do update set is_active = true, updated_at = now();

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
