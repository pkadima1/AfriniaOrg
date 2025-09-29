import React from 'react';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Linkedin, Link2, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  title: string;
  url: string;
  description?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ title, url, description = '' }) => {
  const { toast } = useToast();
  
  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);
  const shareDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
    whatsapp: `https://wa.me/?text=${shareTitle}%20${shareUrl}`
  };

  const handleShare = (platform: string, link: string) => {
    window.open(link, '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "The article link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground mr-2">Share:</span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare('facebook', shareLinks.facebook)}
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        <Facebook className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare('twitter', shareLinks.twitter)}
        className="text-sky-500 hover:text-sky-600 hover:bg-sky-50"
      >
        <Twitter className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare('linkedin', shareLinks.linkedin)}
        className="text-blue-700 hover:text-blue-800 hover:bg-blue-50"
      >
        <Linkedin className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare('whatsapp', shareLinks.whatsapp)}
        className="text-green-600 hover:text-green-700 hover:bg-green-50"
      >
        <MessageCircle className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopyLink}
        className="text-muted-foreground hover:text-foreground"
      >
        <Link2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default SocialShare;