"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Image as ImageIcon, Video, BarChart3, Smile, MapPin } from "@/components/ui/Icons";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { createPost } from "@/services/postService";
import { uploadImages, validateImageFile } from "@/services/cloudinary";
import toast from "@/lib/toast";

export interface ComposerProps {
  onPosted?: () => void | Promise<void>;
  redirectToHome?: boolean;
}

const MAX_IMAGES = 4;

export function Composer({ onPosted, redirectToHome }: ComposerProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [posting, setPosting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const canPost = Boolean(user) && (content.trim().length > 0 || files.length > 0);

  const ACTIONS = [
    { icon: ImageIcon, label: t.photo, color: "text-green-600", key: "photo" },
    { icon: Video, label: t.video, color: "text-red-500", key: "video" },
    { icon: BarChart3, label: t.poll, color: "text-yellow-600", key: "poll" },
    { icon: Smile, label: t.feeling, color: "text-orange-500", key: "feeling" },
    { icon: MapPin, label: t.location, color: "text-blue-600", key: "location" },
  ] as const;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    const accepted: File[] = [];
    for (const f of list) {
      const err = validateImageFile(f);
      if (err) {
        toast.error(err);
        continue;
      }
      accepted.push(f);
    }
    const next = [...files, ...accepted].slice(0, MAX_IMAGES);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
    setExpanded(true);
    e.target.value = "";
  };

  const removeAt = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handlePost = async () => {
    if (!user) {
      toast.error("Sign in to post");
      return;
    }
    if (!content.trim() && files.length === 0) {
      toast.error("Write something or add a photo");
      return;
    }

    setPosting(true);
    try {
      let media:
        | { type: "image"; url: string; publicId?: string; width?: number; height?: number }[]
        | undefined;

      if (files.length) {
        // Must succeed on Cloudinary — never blob URLs (not visible to others)
        const uploaded = await uploadImages(files);
        media = uploaded.map((u) => ({
          type: "image" as const,
          url: u.secureUrl,
          publicId: u.publicId,
          width: u.width,
          height: u.height,
        }));
      }

      const hashtags = content.match(/#[\w\u0600-\u06FF]+/g)?.map((h) => h.slice(1)) || [];

      const post = await createPost({
        authorId: user.uid,
        authorNickname: user.nickname,
        authorAvatar: user.avatarUrl,
        content: content.trim(),
        media,
        visibility: "everyone",
        hashtags,
      });

      setContent("");
      setFiles([]);
      setPreviews([]);
      setExpanded(false);

      toast.success("Posted");
      if (onPosted) await onPosted();
      if (redirectToHome) router.push("/home");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("sirbax:post-created", { detail: post }));
      }
    } catch (e) {
      console.error(e);
      toast.error(
        e instanceof Error ? e.message : "Could not post — check Cloudinary upload"
      );
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mx-3 mb-2 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="flex items-start gap-3">
        <Avatar src={user?.avatarUrl} alt={user?.nickname} size="md" className="ring-2 ring-slate-100" />
        {expanded ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.whatsOnYourMind}
            rows={3}
            autoFocus
            className="min-h-[72px] flex-1 resize-none bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
            maxLength={2000}
          />
        ) : (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex h-10 flex-1 items-center rounded-full bg-slate-100 px-4 text-left text-sm text-slate-500 transition hover:bg-slate-50"
          >
            {t.whatsOnYourMind}
          </button>
        )}
      </div>

      {previews.length > 0 && (
        <div className={`mt-3 grid gap-2 ${previews.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
          {previews.map((src, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="max-h-48 w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
        <div className="flex flex-1 items-center justify-around">
          {ACTIONS.map(({ icon: Icon, label, color, key }) => (
            <button
              key={key}
              type="button"
              onClick={key === "photo" ? () => fileRef.current?.click() : undefined}
              className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 transition hover:bg-slate-50 sm:flex-row sm:gap-1.5"
            >
              <Icon className={`h-[18px] w-[18px] ${color}`} />
              <span className="hidden text-[11px] font-medium text-slate-600 sm:inline">{label}</span>
            </button>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          className="ml-2 rounded-full bg-blue-600 px-5 font-semibold hover:bg-blue-700 disabled:opacity-40"
          disabled={!canPost || posting}
          loading={posting}
          onClick={handlePost}
        >
          {t.post}
        </Button>
      </div>
      {files.length > 0 && (
        <p className="mt-1 text-center text-[11px] text-slate-400">
          {files.length}/{MAX_IMAGES} images · uploaded to Cloudinary for everyone
        </p>
      )}
    </div>
  );
}
