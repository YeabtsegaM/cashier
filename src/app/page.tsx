'use client';

import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function LoginPage() {
  const { login, isLoading } = useAuth();

  const handleLogin = async (username: string, password: string) => {
    return await login(username, password);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-50 to-green-50 flex justify-center pt-20 p-4">
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  );
}
