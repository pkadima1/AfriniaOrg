
-- Create a table for contact form submissions
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed'))
);

-- Add Row Level Security (RLS) - only admin access needed for contact submissions
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to manage contact submissions
CREATE POLICY "Service role can manage contact submissions" 
  ON public.contact_submissions 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Create an index for better performance when querying by date
CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);
