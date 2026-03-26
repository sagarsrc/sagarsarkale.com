import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-[4rem] font-bold text-[var(--fg-muted)] mb-4">404</h1>
      <p className="text-[var(--fg-secondary)] text-sm mb-6">
        This page wandered off. Maybe it&apos;s exploring a latent space somewhere.
      </p>
      <p className="[&_a]:text-[var(--accent)]">
        <Link href="/">Back to home</Link>
      </p>
    </div>
  );
}
