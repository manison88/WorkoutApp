import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import UserSelector from './components/UserSelector';
import Dashboard from './components/Dashboard';
import WorkoutSession from './components/WorkoutSession';
import WorkoutHistory from './components/WorkoutHistory';
import WorkoutSummary from './components/WorkoutSummary';
import BodyMap from './components/BodyMap';
import ExerciseLibrary from './components/ExerciseLibrary';
import ExerciseHistory from './components/ExerciseHistory';

function RequireUser({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const location = useLocation();
  if (!user && location.pathname !== '/') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <RequireUser>
      <Routes>
        <Route path="/" element={<UserSelector />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workout/:id" element={<WorkoutSession />} />
        <Route path="/history" element={<WorkoutHistory />} />
        <Route path="/summary/:id" element={<WorkoutSummary />} />
        <Route path="/body-map" element={<BodyMap />} />
        <Route path="/exercises" element={<ExerciseLibrary />} />
        <Route path="/exercise/:id" element={<ExerciseHistory />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RequireUser>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  );
}
