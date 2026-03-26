import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-[4rem] font-bold text-[var(--fg-muted)] mb-4">404</h1>
      <p className="text-[var(--fg-secondary)] text-sm mb-6">
        This page wandered off. Maybe it&apos;s exploring a latent space somewhere.
      </p>
      <p>
        <Link href="/" className="text-[13px] text-[var(--accent)] underline underline-offset-4 decoration-[var(--accent)]/40 hover:decoration-[var(--accent)] font-medium">back to home</Link>
      </p>
    </div>
  );
}
