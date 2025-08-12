'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Bot, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function FloatingAIButton() {
  const router = useRouter();
  const { user } = useAuth();

  const handleClick = () => {
    if (user) {
      router.push('/ai-chat');
    } else {
      router.push(`/login?redirect=/ai-chat`);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button 
        onClick={handleClick}
        className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
        size="icon"
      >
        <div className="relative">
          <Bot className="h-6 w-6" />
          <div className="absolute -top-1 -right-1">
            <div className="relative">
              <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse" />
            </div>
          </div>
        </div>
        <span className="sr-only">AI Assistant</span>
      </Button>
    </div>
  );
}
