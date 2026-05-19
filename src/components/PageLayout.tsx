import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  sidebar?: ReactNode;
  className?: string;
}

export function PageLayout({ children, sidebar, className = '' }: Props) {
  const hasSidebar = !!sidebar;

  return (
    <div className={hasSidebar ? 'lg:pl-64' : ''}>
      {sidebar}
      <main className={className}>
        {children}
      </main>
    </div>
  );
}
