import { ArrowLeft, MoreVertical, Plus, Send, MessageSquare } from "lucide-react";
import Image from "next/image";
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
      <div className="w-full h-full min-h-[600px] bg-surface-container-lowest flex flex-col items-center justify-center relative rounded-2xl shadow-sm border border-border-subtle overflow-hidden font-sans">
        <div className="flex flex-col items-center text-text-muted opacity-60">
          <MessageSquare className="w-12 h-12 mb-4" />
          <p>Select a lead to view their live chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[600px] bg-surface-container-lowest flex flex-col relative rounded-2xl shadow-[0_10px_25px_-5px_rgba(15,23,42,0.05)] border border-border-subtle overflow-hidden font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-surface-pure border-b border-border-subtle z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button className="p-2 -ml-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container flex items-center justify-center">
              <div className="w-full h-full bg-primary-container text-on-primary-pure flex items-center justify-center font-bold">
                {leadName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h1 className="font-semibold text-sm text-on-surface m-0">{leadName}</h1>
              <p className="text-xs text-text-muted m-0">Live WhatsApp Thread</p>
            </div>
          </div>
        </div>
        <button className="p-2 -mr-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Chat Canvas */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 bg-surface-container-low scroll-smooth">
        {messages.length > 0 && (
          <div className="flex justify-center">
            <span className="bg-surface-container text-on-surface-variant text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-border-subtle">
              Today
            </span>
          </div>
        )}

        {messages.map((msg, idx) => {
          if (msg.role === 'user') {
            return (
              <div key={idx} className="flex flex-col items-end gap-1 w-full max-w-[85%] self-end">
                <div className="bg-surface-variant text-on-surface rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm border border-border-subtle/50">
                  <p className="m-0 text-[15px]">{msg.content}</p>
                </div>
                <span className="text-[11px] text-text-muted">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          } else {
            return (
              <div key={idx} className="flex flex-col items-start gap-1 w-full max-w-[85%] self-start">
                <div className="bg-surface-pure text-on-surface rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-border-subtle relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-container"></div>
                  <p className="m-0 text-[15px] pl-2">{msg.content}</p>
                </div>
                <span className="text-[11px] text-text-muted">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          }
        })}

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-text-muted">
            <p>No messages yet.</p>
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="bg-surface-pure px-6 py-3 border-t border-border-subtle">
        <div className="flex items-end gap-2 bg-surface-container-low rounded-2xl border border-border-subtle p-2 focus-within:border-on-surface transition-colors">
          <button className="p-2 rounded-full text-text-muted hover:bg-surface-container transition-colors shrink-0">
            <Plus className="w-5 h-5" />
          </button>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="w-full bg-transparent border-none focus:ring-0 resize-none text-[15px] text-on-surface placeholder-text-muted py-2 max-h-24 outline-none"
            placeholder="Type a message to intercept..."
            rows={1}
            disabled={isSending}
          ></textarea>
          <button 
            onClick={handleSend}
            disabled={isSending || !inputText.trim()}
            className="p-2 rounded-full bg-primary-container text-on-primary-pure hover:opacity-90 transition-opacity shrink-0 flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mt-3">
          <p className="text-[11px] text-text-muted m-0">Secured by AI Automation Platform</p>
        </div>
      </footer>
    </div>
  );
}
