import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  User, 
  Building2, 
  AlertTriangle, 
  FileText, 
  Milestone,
  Code2,
  HelpCircle,
  Zap,
  RotateCcw
} from 'lucide-react';
import { ChatMessage, ResumeAudit, TargetOpportunity, PreparationRoadmap, UserCareerProfile } from '../types';

interface AdvisorChatViewProps {
  messages: ChatMessage[];
  isChatting: boolean;
  userProfile: UserCareerProfile;
  audit: ResumeAudit | null;
  opportunities: TargetOpportunity[];
  roadmap: PreparationRoadmap | null;
  onSendMessage: (text: string) => void;
  onClearChat?: () => void;
}

// Clean helper to render structured advisor text (supports bolding, headings, blockquotes, bullets, and inline code)
const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 text-xs leading-relaxed font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-serif font-bold text-sm text-[#1F1E1B] mt-2 mb-1 border-b border-[#1F1E1B]/10 pb-0.5">
              {trimmed.replace(/^###\s+/, '')}
            </h4>
          );
        }

        if (trimmed.startsWith('#### ')) {
          return (
            <h5 key={idx} className="font-semibold text-xs text-[#2F4F3A] mt-1.5 mb-0.5 uppercase tracking-wide">
              {trimmed.replace(/^####\s+/, '')}
            </h5>
          );
        }

        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-2 border-[#2F4F3A] pl-3 py-1 my-1.5 bg-emerald-50/60 rounded-r-md text-[#1F1E1B] italic text-[11.5px]">
              {trimmed.replace(/^>\s+/, '')}
            </blockquote>
          );
        }

        if (trimmed === '---') {
          return <hr key={idx} className="border-t border-[#1F1E1B]/10 my-2" />;
        }

        // Parse inline bolding **term** and code `code`
        const parseInline = (str: string) => {
          const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
          return parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={pIdx} className="font-bold text-[#1F1E1B]">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code key={pIdx} className="px-1.5 py-0.5 rounded bg-[#1F1E1B]/8 font-mono text-[11px] text-[#2F4F3A]">
                  {part.slice(1, -1)}
                </code>
              );
            }
            return part;
          });
        };

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex items-start gap-1.5 ml-2">
              <span className="text-[#2F4F3A] font-bold mt-0.5">•</span>
              <span className="flex-1">{parseInline(trimmed.substring(2))}</span>
            </div>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const match = trimmed.match(/^(\d+\.)\s+(.*)$/);
          if (match) {
            return (
              <div key={idx} className="flex items-start gap-1.5 ml-2">
                <span className="font-semibold text-[#2F4F3A]">{match[1]}</span>
                <span className="flex-1">{parseInline(match[2])}</span>
              </div>
            );
          }
        }

        if (trimmed === '') {
          return <div key={idx} className="h-1" />;
        }

        return <p key={idx}>{parseInline(line)}</p>;
      })}
    </div>
  );
};

export const AdvisorChatView: React.FC<AdvisorChatViewProps> = ({
  messages,
  isChatting,
  userProfile,
  audit,
  opportunities,
  roadmap,
  onSendMessage,
  onClearChat
}) => {
  const [input, setInput] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatting) return;
    onSendMessage(input);
    setInput("");
  };

  const handleQuickPrompt = (promptText: string) => {
    if (isChatting) return;
    onSendMessage(promptText);
  };

  const topTargetCompany = opportunities.length > 0 ? opportunities[0].company : "Flipkart / Google";

  return (
    <div id="advisor-chat-view" className="space-y-4">
      {/* Dossier Context Banner */}
      <div className="bg-white rounded-xl border border-[#1F1E1B]/10 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="font-serif text-lg font-bold text-[#1F1E1B] flex items-center gap-2">
                <Bot className="w-5 h-5 text-[#2F4F3A]" />
                PlacePilot Career & Interview Prep Advisor
              </h2>
            </div>
            <p className="text-xs text-[#1F1E1B]/70 mt-0.5">
              Powered by RAG documents & candidate dossier. Specialized in Resume Flaws, Interview Loops, and Data Structures & Algorithms.
            </p>
          </div>

          {/* Active Knowledge & Guardrail Pills + Clear Button */}
          <div className="flex items-center gap-2 flex-wrap text-[11px] font-medium">
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              Guardrail: Career & DSA Domain
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#FAF8F3] border border-[#1F1E1B]/10 text-[#1F1E1B] flex items-center gap-1">
              <FileText className="w-3 h-3 text-[#2F4F3A]" />
              Resume Active
            </span>
            <span className="px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 text-purple-900 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-purple-600" />
              ATS: {audit?.ats_score ?? '72'}/100
            </span>
            {onClearChat && (
              <button
                type="button"
                onClick={onClearChat}
                className="px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 flex items-center gap-1 transition-colors font-medium cursor-pointer"
                title="Clear conversation history and reset chat"
              >
                <RotateCcw className="w-3 h-3" />
                Clear Chat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-xl border border-[#1F1E1B]/10 shadow-sm flex flex-col h-[540px]">
        {/* Messages Feed */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-[#2F4F3A] text-white rounded-br-none'
                      : 'bg-[#FAF8F3] text-[#1F1E1B] border border-[#1F1E1B]/10 rounded-bl-none'
                  }`}
                >
                  {!isUser && msg.referenced_context && (
                    <div className="mb-2 pb-2 border-b border-[#2F4F3A]/15 text-[10px] font-bold text-[#2F4F3A] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      <span>Grounded via: {msg.referenced_context}</span>
                    </div>
                  )}
                  {isUser ? (
                    <p className="whitespace-pre-line font-sans">{msg.text}</p>
                  ) : (
                    <FormattedMessage text={msg.text} />
                  )}
                </div>
                <span className="text-[10px] text-[#1F1E1B]/40 mt-1 px-1">{msg.timestamp}</span>
              </div>
            );
          })}

          {isChatting && (
            <div className="flex items-center gap-2 text-xs text-[#1F1E1B]/70 p-3 bg-emerald-50/50 rounded-lg border border-emerald-200/50 max-w-md animate-pulse">
              <div className="w-3.5 h-3.5 border-2 border-[#2F4F3A]/30 border-t-[#2F4F3A] rounded-full animate-spin shrink-0"></div>
              <span>Formulating customized interview & technical response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts */}
        <div className="px-4 py-2.5 bg-[#FAF8F3] border-t border-[#1F1E1B]/10 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-[#1F1E1B]/60 shrink-0 uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-[#2F4F3A]" />
            Practice Prompts:
          </span>
          <button
            type="button"
            onClick={() => handleQuickPrompt("Help me to prepare this question Introduce yourself")}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-[#1F1E1B]/10 rounded-full text-[#1F1E1B] text-[11px] shrink-0 transition-colors font-medium shadow-2xs"
          >
            🎙️ How to answer "Introduce yourself"
          </button>
          <button
            type="button"
            onClick={() => handleQuickPrompt("Explain Two Pointer vs Sliding Window with code examples and time complexity")}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-[#1F1E1B]/10 rounded-full text-[#1F1E1B] text-[11px] shrink-0 transition-colors font-medium shadow-2xs"
          >
            💡 Two Pointer vs Sliding Window (DSA)
          </button>
          <button
            type="button"
            onClick={() => handleQuickPrompt(`What is the interview loop and machine coding round like for ${topTargetCompany}?`)}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-[#1F1E1B]/10 rounded-full text-[#1F1E1B] text-[11px] shrink-0 transition-colors font-medium shadow-2xs"
          >
            🏢 {topTargetCompany} Interview Loop
          </button>
          <button
            type="button"
            onClick={() => handleQuickPrompt("Rewrite my main project bullet using Google's XYZ formula: Accomplished [X] by doing [Z] as measured by [Y].")}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-[#1F1E1B]/10 rounded-full text-[#1F1E1B] text-[11px] shrink-0 transition-colors font-medium shadow-2xs"
          >
            📄 Google XYZ Bullet Rewrite
          </button>
          <button
            type="button"
            onClick={() => handleQuickPrompt("How to use the STAR method to answer 'Tell me about a challenging technical bug you resolved'?")}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-[#1F1E1B]/10 rounded-full text-[#1F1E1B] text-[11px] shrink-0 transition-colors font-medium shadow-2xs"
          >
            ⭐ STAR Method for Behavioral Questions
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-[#1F1E1B]/10 flex items-center gap-2 rounded-b-xl">
          <input
            id="advisor-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about "Introduce yourself", DSA patterns, ${topTargetCompany} interview loops, or resume rewrites...`}
            className="flex-1 bg-[#FAF8F3] border border-[#1F1E1B]/15 rounded-lg px-3.5 py-2.5 text-xs text-[#1F1E1B] focus:outline-none focus:ring-2 focus:ring-[#2F4F3A]/30 focus:border-[#2F4F3A]"
          />
          <button
            type="submit"
            id="advisor-submit-btn"
            disabled={isChatting || !input.trim()}
            className="px-4 py-2.5 bg-[#2F4F3A] hover:bg-[#253f2e] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
