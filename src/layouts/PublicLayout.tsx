import { Outlet } from 'react-router';

export function PublicLayout() {
  return (
    <div>
      <header className="border-b border-gray-200 px-4 py-3">
        <p className="font-semibold">CLACK</p>
      </header>
      <Outlet />
    </div>
  );
}
