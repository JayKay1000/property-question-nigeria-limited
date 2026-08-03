import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function NewsletterSignup({ source = 'footer', compact = false }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await base44.entities.NewsletterSubscriber.create({
        email,
        source_page: source,
        status: 'subscribed',
        subscribed_date: new Date().toISOString(),
      });
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-sm text-success">
        <CheckCircle2 className="w-5 h-5" />
        <span>You're subscribed! Watch your inbox for insights.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {compact ? (
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
          <Button type="submit" disabled={status === 'loading'} className="bg-flame-500 hover:bg-flame-600 text-white border-0 whitespace-nowrap">
            {status === 'loading' ? '...' : 'Subscribe'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
            <Mail className="w-4 h-4" /> Get market insights & investment tips
          </div>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <Button type="submit" disabled={status === 'loading'} className="bg-flame-500 hover:bg-flame-600 text-white border-0">
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </div>
          {status === 'error' && (
            <p className="text-sm text-red-300">Something went wrong. Please try again.</p>
          )}
        </div>
      )}
    </form>
  );
}