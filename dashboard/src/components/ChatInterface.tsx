import { ArrowLeft, MoreVertical, Plus, Send, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Message {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  messages: Message[];
  leadName?: string | null;
  leadId?: string;
  clientId?: string;
}

export function ChatInterface({ messages, leadName, leadId, clientId }: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [aiPaused, setAiPaused] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !leadId || !clientId || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(`${API_URL}/api/leads/${leadId}/messages?clientId=${clientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: inputText }),
      });
      if (res.ok) {
        setInputText("");
      }
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsSending(false);
    }
  };

  if (!leadName) {
    return (
      <div className="w-full h-full min-h-[600px] bg-white flex flex-col items-center justify-center relative font-sans rounded-2xl">
        <div className="flex flex-col items-center text-slate-400">
          <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-sm font-medium">Select a lead to view their live chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-w-0 relative h-full font-sans text-slate-900 overflow-hidden">
      {/* Chat Header */}
      <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-white/90 backdrop-blur-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold shadow-sm">
            <span className="text-blue-600 text-lg">{leadName.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-lg text-slate-900 font-bold flex items-center gap-2">
              {leadName}
              <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold flex items-center gap-1 shadow-sm transition-colors ${aiPaused ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                {aiPaused ? (
                  <>
                    Manual Mode
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> AI Automating
                  </>
                )}
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 uppercase tracking-widest mt-1">
              Live Thread
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col bg-[#f8fafc] relative scroll-smooth"
      >
        {messages.length > 0 && (
          <div className="text-center">
            <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 font-semibold rounded-full text-[10px] uppercase tracking-widest shadow-sm">
              Today
            </span>
          </div>
        )}

        {messages.map((msg, idx) => {
          if (msg.role === 'user') {
            return (
              <div key={idx} className="flex items-start gap-3 max-w-[80%] animate-fade-in-up">
                <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-slate-600 text-xs font-bold mt-1 shadow-sm">
                  {leadName.charAt(0).toUpperCase()}
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm shadow-sm text-slate-800 text-sm hover:shadow-md transition-shadow">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-[10px] text-slate-400 block mt-1.5 text-left">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          } else {
            return (
              <div key={idx} className="flex items-start gap-3 max-w-[80%] self-end flex-row-reverse animate-fade-in-up">
                <div className="w-8 h-8 rounded-full bg-blue-600 shrink-0 flex items-center justify-center text-white mt-1 shadow-md">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-sm shadow-md text-sm hover:shadow-lg transition-shadow">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-[10px] text-blue-200 block mt-1.5 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          }
        })}

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm font-medium">
            <p>No messages yet.</p>
          </div>
        )}

        <div className="h-4"></div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 mt-auto shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-50 rounded-full px-4 py-2.5 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 flex-1 transition-all shadow-sm">
            <button className="text-slate-400 hover:text-blue-600 transition-colors mr-2">
              <Plus className="w-5 h-5" />
            </button>
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              disabled={isSending}
              className="bg-transparent border-none focus:ring-0 w-full text-sm text-slate-900 p-0 placeholder:text-slate-400 outline-none"
              placeholder="Type a message to intercept..."
              type="text"
            />
          </div>

          <label className={`flex items-center cursor-pointer gap-2 px-4 py-2.5 rounded-full border transition-all shadow-sm hover:shadow-md ${aiPaused ? 'bg-red-50 text-red-700 border-red-300' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`} title="Takeover conversation manually">
            <span className="text-[12px] font-semibold">{aiPaused ? 'AI Paused' : 'Pause AI'}</span>
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={aiPaused}
                onChange={(e) => setAiPaused(e.target.checked)}
              />
              <div className={`block w-8 h-4 rounded-full border transition-colors ${aiPaused ? 'bg-red-200 border-red-300' : 'bg-slate-200 border-slate-300'}`}></div>
              <div className={`dot absolute top-0.5 w-3 h-3 rounded-full transition shadow-sm ${aiPaused ? 'left-[17px] bg-red-600' : 'left-1 bg-white border border-slate-300'}`}></div>
            </div>
          </label>

          <button
            onClick={handleSend}
            disabled={isSending || !inputText.trim()}
            className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md hover:bg-blue-700 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
