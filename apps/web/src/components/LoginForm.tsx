import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loginSchema, formatZodErrors } from '../schemas/task.schema';

interface LoginFormProps {
  onToggle: () => void;
}

export function LoginForm({ onToggle }: LoginFormProps) {
  const { signIn, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: 'email' | 'password', value: string) => {
    const fieldSchema = loginSchema.shape[field];
    const result = fieldSchema.safeParse(value);
    if (!result.success) {
      setFormErrors((prev) => ({ ...prev, [field]: result.error.issues[0].message }));
    } else {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, field === 'email' ? email : password);
  };

  const handleChange = (field: 'email' | 'password', value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    
    // Validate entire form
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      setFormErrors(errors);
      setTouched({ email: true, password: true });
      return;
    }

    setIsLoading(true);

    try {
      await signIn(
        email, 
        password,
        () => {
          // onSuccess - session will update automatically via better-auth
        },
        () => {
          // Error handled in onError callback
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getInputClassName = (fieldName: 'email' | 'password', position: 'first' | 'last' | 'middle') => {
    const hasError = formErrors[fieldName] && touched[fieldName];
    const roundedClass = position === 'first' ? 'rounded-t-md' : position === 'last' ? 'rounded-b-md' : '';
    const borderClass = position === 'last' ? '' : 'border-b-0';
    
    return `
      appearance-none relative block w-full px-3 py-2 
      border border-gray-300 placeholder-gray-500 text-gray-900 
      focus:outline-none focus:z-10 sm:text-sm
      ${roundedClass} ${borderClass}
      ${hasError 
        ? 'bg-rose-50 border-rose-300 focus:ring-rose-500 focus:border-rose-500' 
        : 'focus:ring-indigo-500 focus:border-indigo-500'
      }
    `;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(error?.message || Object.keys(formErrors).length > 0) && (
            <div className="rounded-md bg-rose-50 p-4">
              <div className="text-sm text-rose-700">
                {error?.message || 'Please fix the errors below'}
              </div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                className={getInputClassName('email', 'first')}
                placeholder="Email address"
                value={email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
              />
              {formErrors.email && touched.email && (
                <p className="mt-1 text-xs text-rose-600 px-1">{formErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className={getInputClassName('password', 'last')}
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
              />
              {formErrors.password && touched.password && (
                <p className="mt-1 text-xs text-rose-600 px-1">{formErrors.password}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onToggle}
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
