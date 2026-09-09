"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { uploadImage, validateImageFile } from "@/services/cloudinary";
import { createStory } from "@/services/socialService";
import toast from "@/lib/toast";

export default function CreateStoryPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const err = validateImageFile(f);
    if (err) { toast.error(err); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const publish = async () => {
    if (!file || !user) return;
    setPosting(true);
    try {
      const uploaded = await uploadImage(file);
      await createStory({
        authorId: user.uid,
        authorNickname: user.nickname,
        authorAvatar: user.avatarUrl,
        mediaUrl: uploaded.secureUrl,
      });
      toast.success("Story posted");
      router.replace("/home");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setPosting(false);
    }
  };

  return (
    <AppShell showRight={false}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-3">
        <Link href="/home" className="rounded-full p-1 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold text-slate-900">{t.createStory}</h1>
      </div>
      <div className="flex flex-col items-center px-4 py-8">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="mb-6 max-h-[50vh] w-full max-w-sm rounded-2xl object-cover shadow-md" />
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} className="mb-6 flex h-64 w-full max-w-sm flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-300">
            <span className="text-4xl">+</span>
            <span className="mt-2 text-sm font-medium">Choose photo</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        <div className="flex w-full max-w-sm gap-2">
          {preview && (
            <button type="button" onClick={() => { setPreview(null); setFile(null); }} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700">{t.cancel}</button>
          )}
          <Button className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700" disabled={!file || posting} loading={posting} onClick={publish}>{t.post}</Button>
        </div>
      </div>
    </AppShell>
  );
}
