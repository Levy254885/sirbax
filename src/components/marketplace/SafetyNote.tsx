export function SafetyNote({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-[11px] leading-relaxed text-slate-500">
        Sirbax does not hold marketplace payments. Agree price, payment and delivery directly with the other party.
      </p>
    );
  }
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-amber-950">
      <p className="font-semibold">Stay safe</p>
      <ul className="mt-1 list-inside list-disc space-y-0.5 text-amber-900/90">
        <li>Never send money before verifying the seller and item.</li>
        <li>Meet in a safe public place when possible.</li>
        <li>Do not share passwords, OTPs or bank PINs.</li>
        <li>
          <strong>Sirbax does not hold marketplace funds</strong> — payment is arranged directly between buyer and
          seller.
        </li>
      </ul>
    </div>
  );
}
