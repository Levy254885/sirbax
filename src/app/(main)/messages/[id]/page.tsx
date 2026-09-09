"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowLeft, Send } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { getMessages, sendMessage, conversationId, type ChatMessage } from "@/services/socialService";
import { formatRelativeTime } from "@/lib/utils";
import { generateDefaultAvatar } from "@/utils/nickname";

export default function ChatThreadPage() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const { user } = useAuth();
  const toId = search.get("to") || "";
  const toName = search.get("name") || "User";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const cid = user && toId ? conversationId(user.uid, toId) : id;

  useEffect(() => {
    if (!cid) return;
    getMessages(cid).then((m) => {
      setMessages(m);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });
  }, [cid]);

  const submit = async () => {
    if (!text.trim() || !user || !toId) return;
    setSending(true);
    try {
      const msg = await sendMessage({
        fromId: user.uid, fromNickname: user.nickname, fromAvatar: user.avatarUrl,
        toId, toNickname: toName, text: text.trim(),
      });
      setMessages((prev) => [...prev, msg]);
      setText("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/messages" className="rounded-full p-1 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link>
        <Link href={`/u/${toId}`} className="flex items-center gap-2">
          <Avatar src={generateDefaultAvatar(toName)} alt={toName} size="sm" />
          <span className="text-sm font-semibold text-slate-900">{toName}</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col bg-slate-50 px-3 py-4 pb-28">
        {messages.length === 0 && <p className="py-12 text-center text-sm text-slate-400">Say hello</p>}
        {messages.map((m) => {
          const mine = m.senderId === user?.uid;
          return (
            <div key={m.id} className={`mb-2 flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${mine ? "rounded-br-md bg-blue-600 text-white" : "rounded-bl-md bg-white text-slate-900 shadow-sm"}`}>
                <p>{m.text}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-blue-100" : "text-slate-400"}`}>{formatRelativeTime(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-slate-100 bg-white px-3 py-2 md:bottom-0">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Message..." className="h-10 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm focus:border-blue-500 focus:outline-none" />
          <button type="button" disabled={!text.trim() || sending || !toId} onClick={submit} className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
        </div>
      </div>
    </AppShell>
  );
}
