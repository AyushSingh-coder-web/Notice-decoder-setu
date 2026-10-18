import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, ExternalLink, HelpCircle, AlertCircle } from 'lucide-react';
import { AssistantMessage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: AssistantMessage[];
  onSendMessage: (query: string) => Promise<void>;
  isLoading: boolean;
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isLoading,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle Escape key to close drawer
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickPrompts = [
    'What changed in my latest notices?',
    'Explain my schedule conflicts.',
    'Which deadlines are coming up?',
    'Show me the source for the exam date.',
    'What should I verify before exporting?',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const query = input.trim();
    setInput('');
    onSendMessage(query);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0F1115] border-l border-[#252936] shadow-2xl flex flex-col slide-in-from-right">
      {/* Header */}
      <div className="h-16 px-6 border-b border-[#252936] flex items-center justify-between shrink-0 bg-[#0F1115]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F5F7FA]">Evidence Nexa AI</h3>
            <p className="text-[11px] text-[#A6ACB8]">
              Ground-truth responses from notices & conflict engine
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-[#A6ACB8] hover:text-[#F5F7FA] hover:bg-[#151820] rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
          aria-label="Close Nexa AI"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#151820] border border-[#252936] flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-xs text-[#A6ACB8] max-w-xs mx-auto">
              Ask Nexa AI about notice revisions, time collisions, submission deadlines, or source sentences.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1.5 ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-[#A6ACB8]">
                {msg.role === 'user' ? (
                  <>
                    <span className="font-medium">You</span>
                    <User className="w-3 h-3 text-[#A6ACB8]" />
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-cyan-400" />
                    <span className="font-semibold text-cyan-300">Nexa AI</span>
                    {msg.isLocalFallback && (
                      <span className="text-[9px] text-[#A6ACB8] font-mono">
                        · Academic Grounding Engine
                      </span>
                    )}
                  </>
                )}
              </div>

              <div
                className={`p-3.5 rounded-xl max-w-[92%] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white rounded-tr-none shadow-sm'
                    : 'bg-[#151820] border border-[#252936] text-[#F5F7FA] rounded-tl-none shadow-sm'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}

                {/* Sources / Evidence citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#252936] space-y-1">
                    <span className="text-[10px] font-semibold text-[#A6ACB8] uppercase tracking-wider block">
                      Source Evidence:
                    </span>
                    {msg.sources.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-1.5 rounded bg-[#08090B] border border-[#252936] text-[11px] text-[#A6ACB8]"
                      >
                        <span className="text-cyan-400 font-medium">
                          {s.eventTitle || s.noticeTitle || 'Notice'}
                        </span>
                        {s.excerpt && (
                          <p className="italic text-[#F5F7FA]/90 mt-0.5 line-clamp-2">
                            "{s.excerpt}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-[#A6ACB8] p-3 bg-[#151820] rounded-xl border border-[#252936] w-fit">
            <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>Consulting academic schedule & evidence engine...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="p-3 border-t border-[#252936] bg-[#08090B] space-y-2">
        <span className="text-[10px] text-[#A6ACB8] font-semibold uppercase tracking-wider block">
          Quick Inquiries
        </span>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSendMessage(prompt)}
              className="px-2.5 py-1 text-[11px] text-[#A6ACB8] hover:text-[#F5F7FA] bg-[#151820] hover:bg-[#1e2330] border border-[#252936] rounded-md transition-colors text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#252936] bg-[#0F1115] flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about dates, conflicts, deadlines, or source sentences..."
          className="flex-1 px-3 py-2 bg-[#151820] border border-[#252936] rounded-lg text-xs text-[#F5F7FA] placeholder-[#A6ACB8]/60 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
