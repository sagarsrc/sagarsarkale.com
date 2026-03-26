import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="not-found-container">
      <h1 className="not-found-title">404</h1>
      <p className="not-found-message">
        This page wandered off. Maybe it&apos;s exploring a latent space somewhere.
      </p>
      <p className="not-found-link">
        <Link href="/">Back to home</Link>
      </p>
    </div>
  );
}
