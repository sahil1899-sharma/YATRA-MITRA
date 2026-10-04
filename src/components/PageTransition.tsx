import { Outlet, useLocation } from 'react-router-dom';

// Every route change re-mounts the wrapper (keyed by pathname), replaying a
// soft rise-and-fade so navigation feels cinematic instead of snappy.
export default function PageTransition() {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-enter">
      <Outlet />
    </div>
  );
}
