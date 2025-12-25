-- =============================================
-- Service Requests Migration
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Create enums
CREATE TYPE service_type AS ENUM ('website', 'chatbot', 'voice_agent');

CREATE TYPE service_request_status AS ENUM (
  'draft',
  'submitted',
  'in_review',
  'in_progress',
  'pending_info',
  'completed',
  'cancelled'
);

-- 2. Create service_requests table
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Service identification
  service_type service_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  status service_request_status DEFAULT 'draft',

  -- Common fields
  business_name VARCHAR(255),
  industry VARCHAR(100),
  target_audience TEXT,
  additional_notes TEXT,

  -- Service-specific data stored as JSONB
  intake_data JSONB DEFAULT '{}',

  -- Metadata
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Source tracking
  source VARCHAR(50) DEFAULT 'dashboard',
  onboarding_completed BOOLEAN DEFAULT FALSE
);

-- 3. Create service_request_files table
CREATE TABLE service_request_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- File details
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,

  -- Categorization
  category VARCHAR(50),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes
CREATE INDEX idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_service_type ON service_requests(service_type);
CREATE INDEX idx_service_request_files_request_id ON service_request_files(service_request_id);

-- 5. Create updated_at trigger
CREATE OR REPLACE FUNCTION update_service_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER service_requests_updated_at
  BEFORE UPDATE ON service_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_service_request_updated_at();

-- =============================================
-- Row Level Security Policies
-- =============================================

-- Enable RLS
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_request_files ENABLE ROW LEVEL SECURITY;

-- Service requests policies - Users
CREATE POLICY "Users can view own requests"
  ON service_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own requests"
  ON service_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own requests"
  ON service_requests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own draft requests"
  ON service_requests FOR DELETE
  USING (auth.uid() = user_id AND status = 'draft');

-- Service requests policies - Admins
CREATE POLICY "Admins can view all requests"
  ON service_requests FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all requests"
  ON service_requests FOR UPDATE
  USING (is_admin(auth.uid()));

-- File policies - Users
CREATE POLICY "Users can view own files"
  ON service_request_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload files"
  ON service_request_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own files"
  ON service_request_files FOR DELETE
  USING (auth.uid() = user_id);

-- File policies - Admins
CREATE POLICY "Admins can view all files"
  ON service_request_files FOR SELECT
  USING (is_admin(auth.uid()));

-- =============================================
-- Storage Bucket
-- =============================================

-- Create storage bucket for service request files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-request-files',
  'service-request-files',
  false,
  52428800, -- 50MB limit
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/svg+xml',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'service-request-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own files in storage"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'service-request-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own files from storage"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'service-request-files' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can view all storage files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'service-request-files' AND
    is_admin(auth.uid())
  );
