"use client";

import Link from "next/link";

export function LinkifyText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(\s+)/);
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (/^#[\w\u0600-\u06FF]+$/.test(part)) {
          const tag = part.slice(1);
          return (
            <Link key={i} href={`/hashtag/${encodeURIComponent(tag)}`} className="font-medium text-blue-600 hover:underline">
              {part}
            </Link>
          );
        }
        if (/^@[\w]+$/.test(part)) {
          return (
            <span key={i} className="font-medium text-blue-600">{part}</span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
