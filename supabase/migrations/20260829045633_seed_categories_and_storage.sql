/*
# Seed Default Categories and Create Storage Buckets

1. Default Categories
- Inserts the 9 default blog categories for the CA website if they don't exist.
- Uses slug-based dedup so re-running is safe.

2. Storage Buckets
- Creates three public buckets: blog-images, profile-images, resources.

3. Storage Policies
- Public read access for all three buckets (anyone can view files).
- Only authenticated users can upload, update, delete files in all buckets.
*/

-- Seed default categories (idempotent via ON CONFLICT on slug)
INSERT INTO categories (name, slug, description) VALUES
  ('Taxation', 'taxation', 'Articles about income tax, tax planning, and tax compliance in Nepal'),
  ('Accounting', 'accounting', 'Accounting principles, bookkeeping, and financial record-keeping'),
  ('Audit', 'audit', 'Audit and assurance standards, procedures, and requirements'),
  ('Business', 'business', 'Business operations, strategy, and management guidance'),
  ('Finance', 'finance', 'Financial analysis, planning, and corporate finance'),
  ('PAN & VAT', 'pan-and-vat', 'PAN registration, VAT compliance, and returns'),
  ('Compliance', 'compliance', 'Regulatory compliance, company filings, and statutory requirements'),
  ('Financial Reporting', 'financial-reporting', 'NFRS, NAS, and financial statement preparation'),
  ('Government Updates', 'government-updates', 'Updates from IRD, OCR, and other Nepalese government bodies')
ON CONFLICT (slug) DO NOTHING;

-- ============ STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, authenticated write
-- blog-images
DROP POLICY IF EXISTS "public_read_blog_images" ON storage.objects;
CREATE POLICY "public_read_blog_images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "auth_upload_blog_images" ON storage.objects;
CREATE POLICY "auth_upload_blog_images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "auth_update_blog_images" ON storage.objects;
CREATE POLICY "auth_update_blog_images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'blog-images');

DROP POLICY IF EXISTS "auth_delete_blog_images" ON storage.objects;
CREATE POLICY "auth_delete_blog_images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'blog-images');

-- profile-images
DROP POLICY IF EXISTS "public_read_profile_images" ON storage.objects;
CREATE POLICY "public_read_profile_images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "auth_upload_profile_images" ON storage.objects;
CREATE POLICY "auth_upload_profile_images" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "auth_update_profile_images" ON storage.objects;
CREATE POLICY "auth_update_profile_images" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "auth_delete_profile_images" ON storage.objects;
CREATE POLICY "auth_delete_profile_images" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'profile-images');

-- resources
DROP POLICY IF EXISTS "public_read_resources_bucket" ON storage.objects;
CREATE POLICY "public_read_resources_bucket" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'resources');

DROP POLICY IF EXISTS "auth_upload_resources_bucket" ON storage.objects;
CREATE POLICY "auth_upload_resources_bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'resources');

DROP POLICY IF EXISTS "auth_update_resources_bucket" ON storage.objects;
CREATE POLICY "auth_update_resources_bucket" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'resources');

DROP POLICY IF EXISTS "auth_delete_resources_bucket" ON storage.objects;
CREATE POLICY "auth_delete_resources_bucket" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'resources');
