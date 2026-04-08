import { Link } from 'react-router-dom';

export default function BackButton({ to = '/dashboard', label = 'Home' }: { to?: string; label?: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-all duration-200 mb-3"
    >
      <span>←</span>
      <span>{label}</span>
    </Link>
  );
}
