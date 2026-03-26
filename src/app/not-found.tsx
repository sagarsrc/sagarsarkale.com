import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
      <h1 style={{ fontSize: '6rem', fontWeight: 700, margin: 0 }}>404</h1>
      <p style={{ fontSize: '1.2rem', marginTop: '1rem' }}>Page not found</p>
      <p style={{ marginTop: '1.5rem' }}>
        <Link href="/">Go home</Link>
      </p>
    </div>
  );
}
