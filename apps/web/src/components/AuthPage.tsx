import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);

  return showLogin ? (
    <LoginForm onToggle={() => setShowLogin(false)} />
  ) : (
    <SignupForm onToggle={() => setShowLogin(true)} />
  );
}
