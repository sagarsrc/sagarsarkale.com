interface SectionProps {
  title: string;
  children: React.ReactNode;
  border?: boolean;
}

export function Section({ title, children, border = true }: SectionProps) {
  return (
    <section className="mb-20 max-md:mb-14">
      <div className={`mb-8 ${border ? 'pb-4 border-b border-[var(--border)]' : ''}`}>
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}
