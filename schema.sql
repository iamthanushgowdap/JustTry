-- Supabase SQL Schema for JustTry CRM

-- Users table
CREATE TABLE IF NOT EXISTS crm_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('sales', 'back-office', 'admin')),
  avatar TEXT,
  phone TEXT,
  department TEXT,
  join_date DATE,
  manager TEXT,
  service_types TEXT[], -- Array of service types for back-office specialization
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to existing crm_users table
ALTER TABLE crm_users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE crm_users DROP COLUMN IF EXISTS gmail;
ALTER TABLE crm_users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE crm_users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE crm_users ADD COLUMN IF NOT EXISTS join_date DATE;
ALTER TABLE crm_users ADD COLUMN IF NOT EXISTS manager TEXT;
ALTER TABLE crm_users ADD COLUMN IF NOT EXISTS service_types TEXT[];

-- Leads table
CREATE TABLE IF NOT EXISTS crm_leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('Loan', 'Investment', 'Insurance')),
  sub_category TEXT NOT NULL,
  status TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL DEFAULT 0,
  assigned_to TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  documents JSONB DEFAULT '[]'::jsonb,
  history JSONB DEFAULT '[]'::jsonb,
  bank_details JSONB,
  disbursements JSONB DEFAULT '[]'::jsonb
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON crm_leads(status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_assigned_to ON crm_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_leads_service_type ON crm_leads(service_type);
CREATE INDEX IF NOT EXISTS idx_crm_users_role ON crm_users(role);
CREATE INDEX IF NOT EXISTS idx_crm_users_email ON crm_users(email);
CREATE INDEX IF NOT EXISTS idx_crm_users_department ON crm_users(department);
CREATE INDEX IF NOT EXISTS idx_crm_users_manager ON crm_users(manager);

-- Row Level Security policies (disabled for development)
-- ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE crm_users ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow authenticated users to manage crm_leads" ON crm_leads
--   FOR ALL USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to read crm_users" ON crm_users
--   FOR SELECT USING (auth.role() = 'authenticated');

-- Insert initial users (optional, for development)
INSERT INTO crm_users (name, email, role, avatar) VALUES
  ('Alex Sales', 'alex@justtry.com', 'sales', 'https://i.pravatar.cc/40?u=alex'),
  ('Betty Office', 'betty@justtry.com', 'back-office', 'https://i.pravatar.cc/40?u=betty'),
  ('Charlie Admin', 'charlie@justtry.com', 'admin', 'https://i.pravatar.cc/40?u=charlie')
ON CONFLICT DO NOTHING;

-- Storage bucket for lead documents (public bucket with policy restrictions)
INSERT INTO storage.buckets (id, name, public)
VALUES ('lead-documents', 'lead-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for lead documents
-- Allow authenticated users to upload documents
CREATE POLICY "Allow authenticated users to upload lead documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'lead-documents'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to view documents
CREATE POLICY "Allow authenticated users to view lead documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'lead-documents'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to update their own documents
CREATE POLICY "Allow authenticated users to update lead documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'lead-documents'
    AND auth.role() = 'authenticated'
  );

-- Allow authenticated users to delete documents
CREATE POLICY "Allow authenticated users to delete lead documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'lead-documents'
    AND auth.role() = 'authenticated'
  );
