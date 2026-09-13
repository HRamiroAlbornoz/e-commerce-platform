import { Outlet } from 'react-router';
import { SiteHeader } from '@/components/layout/SiteHeader';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-bone dark:bg-ink">
      <SiteHeader />
      <Outlet />
    </div>
  );
}
