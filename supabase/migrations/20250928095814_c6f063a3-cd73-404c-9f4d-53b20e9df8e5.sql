-- Create comments table for blog posts
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Anyone can view published comments" 
ON public.comments 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_comments_post_slug ON public.comments(post_slug);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();