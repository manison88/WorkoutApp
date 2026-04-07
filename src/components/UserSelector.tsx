import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const users = [
  { id: 1, name: 'Arman', gradient: 'gradient-purple-pink', emoji: '🏋️' },
  { id: 2, name: 'Adnan', gradient: 'gradient-blue-cyan', emoji: '💪' },
];

export default function UserSelector() {
  const { setUser } = useUser();
  const navigate = useNavigate();

  const handleSelect = (id: number, name: string) => {
    setUser({ id, name });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold mb-2 text-center">Workout Tracker</h1>
      <p className="text-gray-400 mb-10 text-center">Who's training today?</p>
      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => handleSelect(u.id, u.name)}
            className={`${u.gradient} flex-1 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 transition-all duration-200 hover:scale-105 hover:shadow-2xl active:scale-95 cursor-pointer`}
          >
            <span className="text-6xl">{u.emoji}</span>
            <span className="text-3xl font-bold text-white">{u.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
