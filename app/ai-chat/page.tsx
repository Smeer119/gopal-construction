'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, User, Bot, Loader2, Lock, AlertCircle } from 'lucide-react';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
};

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/ai-chat');
    }
  }, [user, loading, router]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build quick actions from assistant text (component scope)
  const getQuickActions = (text: string) => {
    const t = text.toLowerCase();
    const actions: { label: string; href: string }[] = [];
    const add = (label: string, href: string) => actions.push({ label, href });

    if (t.includes('dpr') || t.includes('daily progress') || t.includes('daily report')) {
      add('Open DPR', '/engineer/dpr');
    }
    if (t.includes('daily material') || t.includes('materials') || t.includes('material')) {
      add('Materials', '/dashboard/engineer?tab=materials');
    }
    if (t.includes('schedule') || t.includes('scheduling') || t.includes('planner')) {
      add('Scheduling', '/dashboard/engineer?tab=schedule');
    }
    if (t.includes('pour card') || t.includes('pourcard') || t.includes('pour cards')) {
      add('Pour Cards', '/dashboard/engineer?tab=pour-cards');
    }
    return actions;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    // Add user message to chat
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Add a temporary loading message
      const loadingMessage: Message = {
        id: 'loading-' + Date.now(),
        role: 'assistant',
        content: 'Thinking...',
        timestamp: new Date(),
        isLoading: true
      };
      
      // Add loading message
      setMessages(prev => [...prev, loadingMessage]);

      // Call backend AI route
      const resp = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err?.error || 'AI response failed');
      }

      const data = await resp.json();
      const content: string = data?.content || "I'm sorry, I couldn't process your request.";

      // Remove loading message and add response
      setMessages(prev => [
        ...prev.filter(msg => !msg.id.startsWith('loading-')),
        {
          id: Date.now().toString(),
          role: 'assistant',
          content,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove the loading message and show error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('loading-')));
      
      setError(
        error instanceof Error 
          ? error.message 
          : 'An error occurred while processing your request. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Error toast component
  const ErrorToast = () => (
    <div className="fixed bottom-24 right-6 z-50">
      <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in">
        <AlertCircle className="h-5 w-5" />
        <span>{error}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 relative">
      {error && <ErrorToast />}
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">buildkaam AI Assistant</h1>
        </div>
      </header>

      {/* Chat container */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Getting Started</h2>
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Ask me anything about construction, project management, or how to use BuildKaam.
                    I'm here to help you with your construction projects!
                  </p>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-none' 
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {message.isLoading ? (
                    <div className="flex items-center space-x-2 py-2">
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center mb-1">
                        {message.role === 'user' ? (
                          <User className="h-4 w-4 mr-2" />
                        ) : (
                          <Bot className="h-4 w-4 mr-2 text-blue-500" />
                        )}
                        <span className="text-xs font-medium">
                          {message.role === 'user' ? 'You' : 'BuildKaam AI'}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div className="text-xs text-right mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {message.role === 'assistant' && getQuickActions(message.content).length > 0 && (
                        <div className="mt-3 border-t pt-2">
                          <div className="text-xs text-gray-500 mb-2">Quick actions</div>
                          <div className="flex flex-wrap gap-2">
                            {getQuickActions(message.content).map((a: { label: string; href: string }, i: number) => (
                              <Link key={i} href={a.href} className="text-xs">
                                <Button size="sm" variant="outline" className="h-7 text-xs">
                                  {a.label}
                                </Button>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <form 
          onSubmit={handleSendMessage}
          className="max-w-3xl mx-auto flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
