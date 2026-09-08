"use client";

import { useRef, useState } from "react";
import { X, Image as ImageIcon, Video, BarChart3, Smile, MapPin } from "@/components/ui/Icons";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { createPost } from "@/services/postService";
import { uploadImage } from "@/services/cloudinary";
import toast from "@/lib/toast";

const ACTIONS = [
  { icon: ImageIcon, label: "Photo", color: "text-green-600" },
  { icon: Video, label: "Video", color: "text-red-500" },
  { icon: BarChart3, label: "Poll", color: "text-yellow-600" },
  { icon: Smile, label: "Feeling", color: "text-orange-500" },
  { icon: MapPin, label: "Location", color: "text-blue-600" },
] as const;

export function Composer() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [posting, setPosting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Only images in demo"); return; }
    if (f.size > 8 * 1024 * 1024) { toast.error("Under 8MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setExpanded(true);
  };

  const handlePost = async () => {
    if (!content.trim() || !user) return;
    setPosting(true);
    try {
      let media;
      if (file) {
        const uploaded = await uploadImage(file);
        media = [{ type: "image" as const, url: uploaded.secureUrl, publicId: uploaded.publicId, width: uploaded.width, height: uploaded.height }];
      }
      await createPost({
        authorId: user.uid,
        authorNickname: user.nickname,
        authorAvatar: user.avatarUrl,
        content: content.trim(),
        media,
        visibility: "everyone",
        hashtags: (content.match(/#\w+/g) || []).map((h) => h.slice(1)),
        mentions: [],
        commentsDisabled: false,
        sharesDisabled: false,
      });
      toast.success("Posted");
      setContent("");
      setFile(null);
      setPreview(null);
      setExpanded(false);
    } catch {
      toast.error("Could not create post");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mx-3 mb-2 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar src={user?.avatarUrl} alt={user?.nickname} size="md" />
        {expanded ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            autoFocus
            className="min-h-[64px] flex-1 resize-none bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
            maxLength={500}
          />
        ) : (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex h-10 flex-1 items-center rounded-full bg-slate-100 px-4 text-left text-sm text-slate-500"
          >
            What&apos;s on your mind?
          </button>
        )}
      </div>

      {preview && (
        <div className="relative mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="max-h-44 w-full rounded-xl object-cover" />
          <button type="button" onClick={() => { setPreview(null); setFile(null); }} className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
        <div className="flex flex-1 items-center justify-around">
          {ACTIONS.map(({ icon: Icon, label, color }) => (
            <button
              key={label}
              type="button"
              onClick={label === "Photo" ? () => fileRef.current?.click() : undefined}
              className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 sm:flex-row sm:gap-1.5"
            >
              <Icon className={`h-[18px] w-[18px] ${color}`} />
              <span className="hidden text-[11px] font-medium text-slate-600 sm:inline">{label}</span>
            </button>
          ))}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
        {expanded && (
          <Button size="sm" className="ml-2 shrink-0 rounded-lg bg-blue-600 hover:bg-blue-700" disabled={!content.trim() || posting} loading={posting} onClick={handlePost}>
            Post
          </Button>
        )}
      </div>
    </div>
  );
}
