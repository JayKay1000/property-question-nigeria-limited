import { useState } from 'react';
import { Link2, Share2, MessageCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PropertyShare({ property }) {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;
  const shareText = `Check out this property: ${property.title} — ${url}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API not available
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: property.title, text: shareText, url });
      } catch {
        // user cancelled
      }
    }
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={handleCopy} variant="outline" size="sm" className="border-brand-200">
        {copied ? <><Check className="mr-1.5 h-4 w-4 text-success" /> Copied</> : <><Link2 className="mr-1.5 h-4 w-4" /> Copy Link</>}
      </Button>
      {typeof navigator !== 'undefined' && navigator.share && (
        <Button onClick={handleNativeShare} variant="outline" size="sm" className="border-brand-200">
          <Share2 className="mr-1.5 h-4 w-4" /> Share
        </Button>
      )}
      <Button asChild variant="outline" size="sm" className="border-success/30 text-success hover:bg-success/5">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="mr-1.5 h-4 w-4" /> WhatsApp
        </a>
      </Button>
    </div>
  );
}