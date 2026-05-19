import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Дашборд — Smart Tickets',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
