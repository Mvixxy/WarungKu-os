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

/* ─── Avatar ─── */

function BuAisyahAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "size-10" : size === "md" ? "size-8" : "size-6";
  return (
    <img
      src="/bu-aisyah-avatar.svg"
      alt="Bu AIsyah"
      className={cn("rounded-full object-cover shadow-sm ring-1 ring-primary/10", sizeClass)}
      draggable={false}
    />
  );
}

/* ─── Sub-components ─── */

function MessageBubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  return (
    <div className={cn("flex w-full", role === "user" ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[88%] flex items-end gap-2", role === "user" && "w-auto flex-row-reverse gap-0")}>
        {role === "assistant" && <BuAisyahAvatar size="sm" />}
        {children}
      </div>
    </div>
  );
}

function AssistantTextBubble({ text }: { text: string }) {
  return (
    <div className="rounded-2xl rounded-bl-md border border-border bg-secondary/60 px-3.5 py-2.5 text-xs sm:text-sm whitespace-pre-wrap text-foreground leading-relaxed">
      {text}
    </div>
  );
}

function DataMessageCard({ result }: { result: ToolResult }) {
  return (
    <Card size="sm" className="border-border bg-card shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <PackageSearch className="size-3 sm:size-3.5" />
          </span>
          <div className="flex-1">
            <CardTitle className="text-xs sm:text-sm">{result.title}</CardTitle>
            {result.summary && <CardDescription className="mt-0 text-[10px] sm:text-xs">{result.summary}</CardDescription>}
          </div>
          <Badge variant="secondary" className="rounded-full text-[9px] sm:text-[10px] px-1.5 py-0 bg-primary/5 text-primary border-primary/10">DB</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {(result.rows ?? []).map((row, i) => (
          <div key={`${row.label}-${i}`} className="flex items-center justify-between gap-2 rounded-lg bg-secondary/50 px-2.5 py-1.5">
            <span className="text-[10px] sm:text-xs text-muted-foreground">{row.label}</span>
            <span className={cn("text-xs sm:text-sm font-medium", row.tone === "warn" && "text-amber-600", row.tone === "success" && "text-emerald-600")}>
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
    <Card size="sm" className="border-accent/20 bg-accent/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-lg bg-accent/15 text-accent-foreground">
            <Sparkles className="size-3 sm:size-3.5" />
          </span>
          <CardTitle className="flex-1 text-xs sm:text-sm">{result.title}</CardTitle>
          <Badge variant="secondary" className="rounded-full text-[9px] sm:text-[10px] px-1.5 py-0 gap-1 bg-accent/10 text-accent-foreground border-accent/20">
            <TrendingUp className="size-2.5 sm:size-3" /> Saran
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {data?.narrative && (
          <div>
            <p className="text-[9px] sm:text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">Ringkasan</p>
            <p className="text-xs sm:text-sm text-foreground mt-0.5">{data.narrative}</p>
          </div>
        )}
        <div className="space-y-1">
          <p className="text-[9px] sm:text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">Top earner</p>
          {(result.rows ?? []).map((row, i) => (
            <div key={`${row.label}-${i}`} className="flex items-center justify-between rounded-lg bg-card border border-border px-2.5 py-1.5">
              <span className="text-xs sm:text-sm">{row.label}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground">{row.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionMessageCard({ toolName, result }: { toolName: string | null; result: ToolResult }) {
  return (
    <Card size="sm" className="border-accent/25 bg-accent/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-lg bg-accent/15 text-accent-foreground">
            <Wallet className="size-3 sm:size-3.5" />
          </span>
          <div className="flex-1">
            <CardTitle className="text-xs sm:text-sm">{result.title}</CardTitle>
            {toolName && <CardDescription className="mt-0 font-mono text-[9px] sm:text-[10px]">tool: {toolName}</CardDescription>}
          </div>
          <Badge variant="secondary" className="rounded-full text-[9px] sm:text-[10px] px-1.5 py-0 bg-accent/10 text-accent-foreground border-accent/20">Selesai</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {result.summary && <p className="text-xs sm:text-sm font-medium text-foreground">{result.summary}</p>}
        <div className="rounded-lg bg-card border border-border p-2">
          {(result.rows ?? []).map((row, i) => (
            <div key={`${row.label}-${i}`} className="flex items-center justify-between gap-2 border-b border-dashed border-border py-1 text-xs sm:text-sm last:border-0">
              <span className="text-muted-foreground">{row.label}</span>
              <span className={cn("font-medium", row.tone === "warn" && "text-amber-600", row.tone === "success" && "text-emerald-600")}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 rounded-lg bg-accent/10 px-2.5 py-1.5 text-[10px] sm:text-xs text-accent-foreground">
          <Check className="size-3 sm:size-3.5" /> Tersimpan ke database.
        </div>
      </CardContent>
    </Card>
  );
}

function InfoMessageCard({ result }: { result: ToolResult }) {
  return (
    <Card size="sm" className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className={cn("flex size-6 items-center justify-center rounded-lg", result.ok ? "bg-secondary text-muted-foreground" : "bg-destructive/10 text-destructive")}>
            {result.ok ? <BookOpen className="size-3 sm:size-3.5" /> : <AlertTriangle className="size-3 sm:size-3.5" />}
          </span>
          <CardTitle className="flex-1 text-xs sm:text-sm">{result.title}</CardTitle>
        </div>
      </CardHeader>
      {(result.message || result.error) && (
        <CardContent>
          <p className="text-[10px] sm:text-xs text-muted-foreground">{result.message ?? result.error}</p>
        </CardContent>
      )}
    </Card>
  );
}

function NavigationMessageCard({ result }: { result: ToolResult }) {
  const data = (result.data ?? {}) as { href?: string; label?: string };
  return (
    <Card size="sm" className="border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
            <ChevronRight className="size-3 sm:size-3.5" />
          </span>
          <CardTitle className="flex-1 text-xs sm:text-sm">{result.title}</CardTitle>
        </div>
      </CardHeader>
      {data.href && (
        <CardContent>
          <a href={data.href} className="group/nav flex w-full items-center justify-between rounded-lg bg-secondary/60 px-2.5 py-2 text-left transition-colors hover:bg-secondary">
            <div>
              <p className="text-[9px] sm:text-[10px] sm:text-xs text-muted-foreground">Tujuan</p>
              <p className="text-xs sm:text-sm font-medium">{data.label ?? data.href}</p>
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
        <div className="space-y-3 px-3 py-3">
          {visibleMessages.length === 0 && !isLoading && (
            <MessageBubble role="assistant">
              <div className="space-y-2">
                <AssistantTextBubble text="Halo! Saya Bu AIsyah, asisten warungmu. Saya bisa bantu cek stok, hitung untung, atau jalankan aksi langsung. Coba tanya: " />
                <div className="flex flex-wrap gap-1.5 pl-8">
                  {quickPrompts.slice(0, 2).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSend(q)}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/8 border border-primary/15 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                    >
                      <Sparkles className="size-2.5 sm:size-3" />{q}
                    </button>
                  ))}
                </div>
              </div>
            </MessageBubble>
          )}
          {visibleMessages.map((m) => {
            if (m.role === "user") return <MessageBubble key={m.id} role="user"><div className="rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-xs sm:text-sm text-primary-foreground leading-relaxed">{m.content}</div></MessageBubble>;
            if (m.role === "assistant" && m.content.trim()) return <MessageBubble key={m.id} role="assistant"><AssistantTextBubble text={m.content} /></MessageBubble>;
            if (m.role === "tool") return <MessageBubble key={m.id} role="assistant"><ToolCard message={m} /></MessageBubble>;
            return null;
          })}
          {isThinking && (
            <MessageBubble role="assistant">
              <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-border bg-secondary/60 px-3.5 py-2.5">
                <BuAisyahAvatar size="sm" />
                <div className="flex items-center gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-primary" />
                </div>
              </div>
            </MessageBubble>
          )}
          {error && <div className="mx-8 rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2 text-[10px] sm:text-xs text-destructive">{error}</div>}
          <div ref={bottomRef} aria-hidden className="h-px" />
        </div>
      </div>

      <div className="border-t border-border bg-secondary/30 px-3 py-3 shrink-0">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {quickPrompts.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSend(q)}
              disabled={isThinking || !chat}
              className="inline-flex items-center gap-1 rounded-full bg-card border border-border px-2.5 py-1 text-[9px] sm:text-[10px] sm:text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary hover:border-primary/20 disabled:opacity-50"
            >
              <ArrowRight className="size-2.5 sm:size-3" />{q}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
            placeholder="Tanya Bu AIsyah..."
            className="max-h-24 min-h-9 flex-1 resize-none rounded-xl border-border bg-card py-2 text-xs sm:text-sm focus:ring-primary/20"
            rows={1}
            disabled={!chat}
          />
          <Button variant="outline" size="icon-sm" className="size-9 rounded-xl border-border hover:bg-secondary hover:text-primary" onClick={() => toast.info("Voice belum tersedia.")} aria-label="Rekam">
            <Mic className="size-3 sm:size-3.5" />
          </Button>
          <Button size="icon-sm" className="size-9 rounded-xl bg-primary hover:bg-primary/90 shadow-sm" onClick={() => handleSend(input)} disabled={!input.trim() || isThinking || !chat} aria-label="Kirim">
            <Send className="size-3 sm:size-3.5" />
          </Button>
        </div>
        <p className="mt-1.5 text-[8px] sm:text-[10px] text-muted-foreground/70 text-center">Aksi langsung tertulis ke database oleh Bu AIsyah</p>
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
      setError(err instanceof Error ? err.message : "Gagal memuat chat Bu AIsyah.");
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
        aria-label="Bu AIsyah"
      >
        {!open ? (
          <button
            type="button"
            onClick={() => onOpenChange(true)}
            className="group/rail flex h-full w-full flex-col items-center justify-center gap-2 px-2 py-4 text-muted-foreground transition-colors hover:bg-secondary/60"
            aria-label="Buka Bu AIsyah"
          >
            <BuAisyahAvatar size="md" />
            <span className="text-[9px] sm:text-[10px] font-medium tracking-wide text-primary" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
              Bu AIsyah
            </span>
          </button>
        ) : (
          <>
            <header className="flex items-center gap-2.5 border-b border-border px-3 py-3 shrink-0 bg-gradient-to-r from-secondary/80 to-card">
              <BuAisyahAvatar size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-heading text-sm font-semibold text-foreground">Bu AIsyah</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Asisten WarungKu</p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={handleNewChat} disabled={isLoading || isThinking} className="size-7 rounded-lg hover:bg-secondary hover:text-primary">
                <ArrowRight className="size-3 sm:size-3.5" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)} className="size-7 rounded-lg hover:bg-secondary hover:text-primary">
                <X className="size-3 sm:size-3.5" />
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

      {/* ── Mobile: bottom sheet ── */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => onOpenChange(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col max-h-[85vh] rounded-t-3xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-primary/30" />
            </div>
            <header className="flex items-center gap-2.5 border-b border-border px-3 py-3 shrink-0 bg-gradient-to-r from-secondary/80 to-card">
              <BuAisyahAvatar size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-heading text-sm font-semibold text-foreground">Bu AIsyah</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Asisten WarungKu</p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={handleNewChat} disabled={isLoading || isThinking} className="size-7 rounded-lg hover:bg-secondary hover:text-primary">
                <ArrowRight className="size-3 sm:size-3.5" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => onOpenChange(false)} className="size-7 rounded-lg hover:bg-secondary hover:text-primary">
                <X className="size-3 sm:size-3.5" />
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
