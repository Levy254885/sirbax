"use client";

import { useRef, useState } from "react";
import { Image, Video, Smile, MapPin, BarChart3, X } from "@/components/ui/Icons";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { createPost } from "@/services/postService";
import { uploadImage } from "@/services/cloudinary";
import toast from "@/lib/toast";

export function Composer() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Only images are supported in demo");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
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
      toast.success("Posted as " + user.nickname);
      setContent("");
      setFile(null);
      setPreview(null);
    } catch {
      toast.error("Could not create post");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="border-b border-border bg-card p-4">
      <div className="flex gap-3">
        <Avatar src={user?.avatarUrl} alt={user?.nickname} size="md" />
        <div className="flex-1">
          <p className="mb-2 text-xs text-muted-foreground">
            Posting as <span className="font-medium text-foreground">{user?.nickname}</span>
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full resize-none bg-transparent text-[15px] placeholder:text-muted-foreground focus:outline-none"
            maxLength={500}
          />
          {preview && (
            <div className="relative mt-2 inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="max-h-48 rounded-xl object-cover" />
              <button
                type="button"
                onClick={() => { setPreview(null); setFile(null); }}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex gap-1">
              <button type="button" className="rounded-lg p-2 text-muted-foreground hover:bg-muted" title="Photo" onClick={() => fileRef.current?.click()}>
                <Image className="h-5 w-5" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              <button type="button" className="rounded-lg p-2 text-muted-foreground hover:bg-muted" title="Video"><Video className="h-5 w-5" /></button>
              <button type="button" className="rounded-lg p-2 text-muted-foreground hover:bg-muted" title="Feeling"><Smile className="h-5 w-5" /></button>
              <button type="button" className="rounded-lg p-2 text-muted-foreground hover:bg-muted" title="Location"><MapPin className="h-5 w-5" /></button>
              <button type="button" className="rounded-lg p-2 text-muted-foreground hover:bg-muted" title="Poll"><BarChart3 className="h-5 w-5" /></button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{content.length}/500</span>
              <Button size="sm" disabled={!content.trim() || posting} loading={posting} onClick={handlePost}>Post</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
