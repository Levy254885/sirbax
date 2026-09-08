"use client";

import { useRef, useState } from "react";
import { X } from "@/components/ui/Icons";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { createPost } from "@/services/postService";
import { uploadImage } from "@/services/cloudinary";
import toast from "@/lib/toast";

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
    if (!f.type.startsWith("image/")) {
      toast.error("Only images in demo");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB");
      return;
    }
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
        media = [{
          type: "image" as const,
          url: uploaded.secureUrl,
          publicId: uploaded.publicId,
          width: uploaded.width,
          height: uploaded.height,
        }];
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
    <div className="mx-3 mb-2 rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar src={user?.avatarUrl} alt={user?.nickname} size="md" />
        {expanded ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            autoFocus
            className="min-h-[72px] flex-1 resize-none bg-transparent text-[15px] placeholder:text-muted-foreground focus:outline-none"
            maxLength={500}
          />
        ) : (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex h-10 flex-1 items-center rounded-full bg-muted px-4 text-left text-sm text-muted-foreground"
          >
            What&apos;s on your mind?
          </button>
        )}
      </div>

      {preview && (
        <div className="relative mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="max-h-48 w-full rounded-xl object-cover" />
          <button
            type="button"
            onClick={() => { setPreview(null); setFile(null); }}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
        <div className="flex flex-1 items-center justify-around">
          <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
            <span className="text-base">📷</span>
            <span className="hidden sm:inline">Photo</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button type="button" className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
            <span className="text-base">🎬</span>
            <span className="hidden sm:inline">Video</span>
          </button>
          <button type="button" className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
            <span className="text-base">📊</span>
            <span className="hidden sm:inline">Poll</span>
          </button>
          <button type="button" className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
            <span className="text-base">😊</span>
            <span className="hidden sm:inline">Feeling</span>
          </button>
          <button type="button" className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
            <span className="text-base">📍</span>
            <span className="hidden sm:inline">Location</span>
          </button>
        </div>
        {expanded && (
          <Button size="sm" className="ml-2" disabled={!content.trim() || posting} loading={posting} onClick={handlePost}>
            Post
          </Button>
        )}
      </div>
    </div>
  );
}
