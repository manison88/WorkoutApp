import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/history', label: 'History', icon: '📋' },
  { to: '/body-map', label: 'Body Map', icon: '🧍' },
  { to: '/exercises', label: 'Exercises', icon: '🏋️' },
];

export default function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-white gradient-purple-pink bg-clip-text'
                  : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            <span className="text-xs font-medium">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
