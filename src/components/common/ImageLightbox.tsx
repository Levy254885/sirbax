"use client";

import { useEffect, useCallback, useRef } from "react";
import { X } from "@/components/ui/Icons";
import { displayImageUrl } from "@/services/cloudinary";

interface Props {
  urls: string[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}

export function ImageLightbox({ urls, index, onClose, onIndex }: Props) {
  const touchX = useRef(0);

  const prev = useCallback(() => {
    onIndex((index - 1 + urls.length) % urls.length);
  }, [index, urls.length, onIndex]);

  const next = useCallback(() => {
    onIndex((index + 1) % urls.length);
  }, [index, urls.length, onIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, prev, next]);

  const src = displayImageUrl(urls[index], 1600);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95"
      onClick={onClose}
      role="dialog"
      aria-modal
    >
      <button
        type="button"
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X className="h-6 w-6" />
      </button>

      {urls.length > 1 && (
        <p className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-sm text-white">
          {index + 1} / {urls.length}
        </p>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="max-h-[90vh] max-w-[95vw] object-contain select-none"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (dx > 50) prev();
          if (dx < -50) next();
        }}
        draggable={false}
      />

      {urls.length > 1 && (
        <>
          <button
            type="button"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 px-3 py-4 text-2xl font-bold text-white hover:bg-white/30"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 px-3 py-4 text-2xl font-bold text-white hover:bg-white/30"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
