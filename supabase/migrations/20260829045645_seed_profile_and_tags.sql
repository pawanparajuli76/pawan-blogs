/*
# Seed Default Profile and Tags

1. Default Profile
- Inserts a default profile row for Pawan Parajuli, Chartered Accountant.
- Provides editable contact info and professional bio.

2. Default Tags
- Seeds common Nepal-specific tags: PAN, VAT, D1, D2, D3, IRD, TDS, Income Tax, Finance Act, NFRS, Small Business, Sole Proprietorship.
- Idempotent via ON CONFLICT on slug.
*/

INSERT INTO profiles (full_name, professional_title, bio, email, phone, location)
VALUES (
  'Pawan Parajuli',
  'Chartered Accountant',
  'I am a Chartered Accountant with professional experience in accounting, taxation, auditing, financial reporting and business advisory. Through this platform, I share practical insights and updates to help individuals and businesses better understand Nepal''s financial and regulatory environment.',
  'pawanparajuli33@gmail.com',
  '9846796501',
  'Nepal'
)
ON CONFLICT DO NOTHING;

INSERT INTO tags (name, slug) VALUES
  ('PAN', 'pan'),
  ('VAT', 'vat'),
  ('D1', 'd1'),
  ('D2', 'd2'),
  ('D3', 'd3'),
  ('IRD', 'ird'),
  ('TDS', 'tds'),
  ('Income Tax', 'income-tax'),
  ('Finance Act', 'finance-act'),
  ('NFRS', 'nfrs'),
  ('Small Business', 'small-business'),
  ('Sole Proprietorship', 'sole-proprietorship')
ON CONFLICT (slug) DO NOTHING;
