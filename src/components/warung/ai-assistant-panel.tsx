"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Mic,
  PackageSearch,
  Send,
  Sparkles,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Tone = "default" | "warn" | "success";

type ToolResult = {
  ok: boolean;
  kind: "data" | "suggestion" | "action" | "navigation" | "info";
  title: string;
  summary?: string;
  rows?: Array<{ label: string; value: string; tone?: Tone }>;
  data?: unknown;
  message?: string;
  error?: string;
};

type ChatRecord = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

type ServerMessage = {
  id: string;
  chatId: string;
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  toolName: string | null;
  toolCallId: string | null;
  toolCalls: unknown;
  toolArgs: unknown;
  toolResult: ToolResult | null;
  createdAt: string;
};

const quickPrompts = [
  "Sisa stok semua produk?",
  "Untung minggu ini berapa?",
  "Pelanggan yang belum lunas?",
  "Rekomendasi restok untuk untung",
];

async function api<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!res.ok) throw new Error(data?.error ?? `Permintaan gagal (${res.status}).`);
  return data as T;
}

/* ─── Sub-components ─── */

function MessageBubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  return (
    <div className={cn("flex w-full", role === "user" ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[88%]", role === "user" && "w-auto")}>
        {children}
      </div>
    </div>
  );
}

function AssistantTextBubble({ text }: { text: string }) {
  return (
    <div className="rounded-xl rounded-bl-md border border-border bg-card px-3 py-2 text-xs whitespace-pre-wrap text-foreground">
      {text}
    </div>
  );
}

function DataMessageCard({ result }: { result: ToolResult }) {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <PackageSearch className="size-3" />
          </span>
          <div className="flex-1">
            <CardTitle className="text-xs">{result.title}</CardTitle>
            {result.summary && <CardDescription className="mt-0 text-[10px]">{result.summary}</CardDescription>}
          </div>
          <Badge variant="secondary" className="rounded-full text-[9px] px-1.5 py-0">DB</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {(result.rows ?? []).map((row, i) => (
          <div key={`${row.label}-${i}`} className="flex items-center justify-between gap-2 rounded-md bg-muted/50 px-2.5 py-1.5">
            <span className="text-[10px] text-muted-foreground">{row.label}</span>
            <span className={cn("text-xs font-medium", row.tone === "warn" && "text-amber-600", row.tone === "success" && "text-emerald-600")}>
              {row.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SuggestionMessageCard({ result }: { result: ToolResult }) {
  const data = result.data as { narrative?: string } | null;
  return (
    <Card size="sm" className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-3" />
          </span>
          <CardTitle className="flex-1 text-xs">{result.title}</CardTitle>
          <Badge variant="secondary" className="rounded-full text-[9px] px-1.5 py-0 gap-1">
            <TrendingUp className="size-2.5" /> Saran
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {data?.narrative && (
          <div>
            <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Ringkasan</p>
            <p className="text-xs text-foreground mt-0.5">{data.narrative}</p>
          </div>
        )}
        <div className="space-y-1">
          <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Top earner</p>
          {(result.rows ?? []).map((row, i) => (
            <div key={`${row.label}-${i}`} className="flex items-center justify-between rounded-md bg-card border border-border px-2.5 py-1.5">
              <span className="text-xs">{row.label}</span>
              <span className="text-[10px] text-muted-foreground">{row.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionMessageCard({ toolName, result }: { toolName: string | null; result: ToolResult }) {
  return (
    <Card size="sm" className="border-accent/30 bg-accent/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-accent/20 text-accent-foreground">
            <Wallet className="size-3" />
          </span>
          <div className="flex-1">
            <CardTitle className="text-xs">{result.title}</CardTitle>
            {toolName && <CardDescription className="mt-0 font-mono text-[9px]">tool: {toolName}</CardDescription>}
          </div>
          <Badge variant="secondary" className="rounded-full text-[9px] px-1.5 py-0">Selesai</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {result.summary && <p className="text-xs font-medium text-foreground">{result.summary}</p>}
        <div className="rounded-md bg-card border border-border p-2">
          {(result.rows ?? []).map((row, i) => (
            <div key={`${row.label}-${i}`} className="flex items-center justify-between gap-2 border-b border-dashed border-border py-1 text-xs last:border-0">
              <span className="text-muted-foreground">{row.label}</span>
              <span className={cn("font-medium", row.tone === "warn" && "text-amber-600", row.tone === "success" && "text-emerald-600")}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 rounded-md bg-accent/10 px-2.5 py-1.5 text-[10px] text-accent-foreground">
          <Check className="size-3" /> Tersimpan ke database.
        </div>
      </CardContent>
    </Card>
  );
}

function InfoMessageCard({ result }: { result: ToolResult }) {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className={cn("flex size-6 items-center justify-center rounded-md", result.ok ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive")}>
            {result.ok ? <BookOpen className="size-3" /> : <AlertTriangle className="size-3" />}
          </span>
          <CardTitle className="flex-1 text-xs">{result.title}</CardTitle>
        </div>
      </CardHeader>
      {(result.message || result.error) && (
        <CardContent>
          <p className="text-[10px] text-muted-foreground">{result.message ?? result.error}</p>
        </CardContent>
      )}
    </Card>
  );
}

function NavigationMessageCard({ result }: { result: ToolResult }) {
  const data = (result.data ?? {}) as { href?: string; label?: string };
  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <ChevronRight className="size-3" />
          </span>
          <CardTitle className="flex-1 text-xs">{result.title}</CardTitle>
        </div>
      </CardHeader>
      {data.href && (
        <CardContent>
          <a href={data.href} className="group/nav flex w-full items-center justify-between rounded-md bg-muted px-2.5 py-2 text-left transition-colors hover:bg-muted/70">
            <div>
              <p className="text-[9px] text-muted-foreground">Tujuan</p>
              <p className="text-xs font-medium">{data.label ?? data.href}</p>
            </div>
            <ChevronRight className="size-3 text-muted-foreground transition-transform group-hover/nav:translate-x-0.5" />
          </a>
        </CardContent>
      )}
    </Card>
  );
}

function ToolCard({ message }: { message: ServerMessage }) {
  const result = message.toolResult;
  if (!result) return null;
  switch (result.kind) {
    case "data": return <DataMessageCard result={result} />;
    case "suggestion": return <SuggestionMessageCard result={result} />;
    case "action": return <ActionMessageCard toolName={message.toolName} result={result} />;
    case "navigation": return <NavigationMessageCard result={result} />;
    case "info":
    default: return <InfoMessageCard result={result} />;
  }
}

/* ─── Chat content (shared between mobile & desktop) ─── */

function ChatContent({
  messages,
  visibleMessages,
  isThinking,
  isLoading,
  error,
  input,
  setInput,
  handleSend,
  handleNewChat,
  chat,
  quickPrompts,
  bottomRef,
}: {
  messages: ServerMessage[];
  visibleMessages: ServerMessage[];
  isThinking: boolean;
  isLoading: boolean;
  error: string | null;
  input: string;
  setInput: (v: string) => void;
  handleSend: (text: string) => void;
  handleNewChat: () => void;
  chat: ChatRecord | null;
  quickPrompts: string[];
  bottomRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="space-y-2.5 px-3 py-3">
          {visibleMessages.length === 0 && !isLoading && (
            <MessageBubble role="assistant">
              <AssistantTextBubble text="Halo! Saya WarungOS AI. Saya bisa cek stok, hitung untung, atau jalankan aksi. Coba: 'untung minggu ini berapa?'" />
            </MessageBubble>
          )}
          {visibleMessages.map((m) => {
            if (m.role === "user") return <MessageBubble key={m.id} role="user"><div className="rounded-xl rounded-br-md bg-primary px-3 py-2 text-xs text-primary-foreground">{m.content}</div></MessageBubble>;
            if (m.role === "assistant" && m.content.trim()) return <MessageBubble key={m.id} role="assistant"><AssistantTextBubble text={m.content} /></MessageBubble>;
            if (m.role === "tool") return <MessageBubble key={m.id} role="assistant"><ToolCard message={m} /></MessageBubble>;
            return null;
          })}
          {isThinking && (
            <MessageBubble role="assistant">
              <div className="inline-flex items-center gap-1 rounded-xl rounded-bl-md border border-border bg-card px-3 py-2">
                <span className="size-1 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
                <span className="size-1 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
                <span className="size-1 animate-bounce rounded-full bg-primary" />
              </div>
            </MessageBubble>
          )}
          {error && <div className="rounded-md bg-destructive/10 px-2.5 py-1.5 text-[10px] text-destructive">{error}</div>}
          <div ref={bottomRef} aria-hidden className="h-px" />
        </div>
      </div>

      <div className="border-t border-border bg-muted/30 px-2.5 py-2.5 shrink-0">
        <div className="mb-1.5 flex flex-wrap gap-1">
          {quickPrompts.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSend(q)}
              disabled={isThinking || !chat}
              className="inline-flex items-center gap-0.5 rounded-md bg-card border border-border px-2 py-0.5 text-[9px] font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary disabled:opacity-50"
            >
              <ArrowRight className="size-2.5" />{q}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-1.5">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
            placeholder="Tanya stok, untung, atau perintah..."
            className="max-h-24 min-h-8 flex-1 resize-none rounded-lg border-border bg-card py-1.5 text-xs"
            rows={1}
            disabled={!chat}
          />
          <Button variant="outline" size="icon-sm" className="size-8 rounded-md" onClick={() => toast.info("Voice belum tersedia.")} aria-label="Rekam">
            <Mic className="size-3" />
          </Button>
          <Button size="icon-sm" className="size-8 rounded-md" onClick={() => handleSend(input)} disabled={!input.trim() || isThinking || !chat} aria-label="Kirim">
            <Send className="size-3" />
          </Button>
        </div>
        <p className="mt-1 text-[8px] text-muted-foreground">Aksi langsung tertulis ke database.</p>
      </div>
    </>
  );
}

/* ─── Main component ─── */

export function AIAssistantPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (next: boolean) => void }) {
  const [chat, setChat] = useState<ChatRecord | null>(null);
  const [messages, setMessages] = useState<ServerMessage[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasBootstrappedRef = useRef(false);

  const bootstrap = useCallback(async () => {
    if (hasBootstrappedRef.current) return;
    hasBootstrappedRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const list = await api<{ chats: ChatRecord[] }>("/api/ai/chats");
      let active = list.chats[0] ?? null;
      if (!active) {
        const created = await api<{ chat: ChatRecord }>("/api/ai/chats", {
          method: "POST",
          body: JSON.stringify({ title: "Percakapan baru" }),
        });
        active = created.chat;
      }
      setChat(active);
      const detail = await api<{ messages: ServerMessage[] }>(`/api/ai/chats/${active.id}/messages`);
      setMessages(detail.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat chat AI.");
      hasBootstrappedRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void bootstrap();
  }, [open, bootstrap]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [open, messages, isThinking]);

  async function handleSend(text: string) {
    const trimmed = text.trim();
    if (!trimmed || !chat || isThinking) return;
    const optimistic: ServerMessage = {
      id: `local_${Date.now()}`, chatId: chat.id, role: "user", content: trimmed,
      toolName: null, toolCallId: null, toolCalls: null, toolArgs: null, toolResult: null,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setIsThinking(true);
    setError(null);
    try {
      const res = await api<{ newMessages: ServerMessage[] }>(`/api/ai/chats/${chat.id}/messages`, {
        method: "POST", body: JSON.stringify({ text: trimmed }),
      });
      setMessages((prev) => [...prev.filter((m) => m.id !== optimistic.id), ...res.newMessages]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengirim.";
      setError(msg);
      toast.error(msg);
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setIsThinking(false);
    }
  }

  async function handleNewChat() {
    setIsLoading(true);
    setError(null);
    try {
      const created = await api<{ chat: ChatRecord }>("/api/ai/chats", {
        method: "POST", body: JSON.stringify({ title: "Percakapan baru" }),
      });
      setChat(created.chat);
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat chat baru.");
    } finally {
      setIsLoading(false);
    }
  }

  const visibleMessages = messages.filter((m) => m.role !== "system");

  return (
    <>
      {/* ── Desktop: sidebar rail + panel ── */}
      <aside
        className={cn(
          "hidden lg:flex h-full shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[width] duration-200 ease-out",
          open ? "w-[360px] xl:w-[400px]" : "w-[56px]"
        )}
        aria-label="Asisten AI"
      >
        {!open ? (
          <button
            type="button"
            onClick={() => onOpenChange(true)}
            className="group/rail flex h-full w-full flex-col items-center justify-center gap-2 px-2 py-4 text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Buka asisten AI"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover/rail:scale-105">
              <Sparkles className="size-3.5" />
            </span>
            <span className="text-[9px] font-medium tracking-wide" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
              Asisten AI
            </span>
          </button>
        ) : (
          <>
            <header className="flex items-center gap-2 border-b border-border px-3 py-2.5 shrink-0">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sparkles className="size-3" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-xs font-semibold truncate">{chat?.title ?? "AI"}</p>
                <p className="text-[9px] text-muted-foreground">OpenRouter · Tool calling</p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={handleNewChat} disabled={isLoading || isThinking} className="size-7 rounded-md">
                <ArrowRight className="size-3" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)} className="size-7 rounded-md">
                <X className="size-3" />
              </Button>
            </header>
            <ChatContent
              messages={messages}
              visibleMessages={visibleMessages}
              isThinking={isThinking}
              isLoading={isLoading}
              error={error}
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              handleNewChat={handleNewChat}
              chat={chat}
              quickPrompts={quickPrompts}
              bottomRef={bottomRef}
            />
          </>
        )}
      </aside>

      {/* ── Mobile: floating button ── */}
      {!open && (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="fixed bottom-[72px] right-5 z-40 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 lg:hidden"
          aria-label="Buka asisten AI"
        >
          <Sparkles className="size-5" />
        </button>
      )}

      {/* ── Mobile: bottom sheet ── */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => onOpenChange(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col max-h-[85vh] rounded-t-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="h-1 w-8 rounded-full bg-muted-foreground/30" />
            </div>
            <header className="flex items-center gap-2 border-b border-border px-3 py-2.5 shrink-0">
              <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sparkles className="size-3" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-heading text-xs font-semibold truncate">{chat?.title ?? "AI"}</p>
                <p className="text-[9px] text-muted-foreground">OpenRouter · Tool calling</p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={handleNewChat} disabled={isLoading || isThinking} className="size-7 rounded-md">
                <ArrowRight className="size-3" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)} className="size-7 rounded-md">
                <X className="size-3" />
              </Button>
            </header>
            <ChatContent
              messages={messages}
              visibleMessages={visibleMessages}
              isThinking={isThinking}
              isLoading={isLoading}
              error={error}
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              handleNewChat={handleNewChat}
              chat={chat}
              quickPrompts={quickPrompts}
              bottomRef={bottomRef}
            />
          </div>
        </div>
      )}
    </>
  );
}
