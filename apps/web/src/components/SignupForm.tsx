import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signupSchema, formatZodErrors } from '../schemas/task.schema';

interface SignupFormProps {
  onToggle: () => void;
}

export function SignupForm({ onToggle }: SignupFormProps) {
  const { signUp, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string) => {
    if (field === 'confirmPassword') {
      if (value !== password) {
        setFormErrors((prev) => ({ ...prev, [field]: 'Passwords do not match' }));
      } else {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
      return;
    }

    const fieldSchema = signupSchema.shape[field as keyof typeof signupSchema.shape];
    if (fieldSchema) {
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
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = field === 'name' ? name : field === 'email' ? email : field === 'password' ? password : confirmPassword;
    validateField(field, value);
  };

  const handleChange = (field: string, value: string) => {
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validate confirm password
    if (password !== confirmPassword) {
      setFormErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      setTouched((prev) => ({ ...prev, confirmPassword: true }));
    }

    // Validate entire form
    const result = signupSchema.safeParse({ email, password, name });
    if (!result.success) {
      const errors = formatZodErrors(result.error);
      setFormErrors((prev) => ({ ...prev, ...errors }));
      setTouched({ email: true, password: true, name: true, confirmPassword: true });
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    setIsLoading(true);

    try {
      await signUp(
        email,
        password,
        name,
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

  const getInputClassName = (_fieldName: string, hasError: boolean, position: 'first' | 'last' | 'middle') => {
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

  const hasError = (field: string): boolean => !!(formErrors[field] && touched[field]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
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
              <label htmlFor="name" className="sr-only">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={getInputClassName('name', hasError('name'), 'first')}
                placeholder="Name (optional)"
                value={name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
              />
              {formErrors.name && touched.name && (
                <p className="mt-1 text-xs text-rose-600 px-1">{formErrors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={getInputClassName('email', hasError('email'), 'middle')}
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
                autoComplete="new-password"
                required
                className={getInputClassName('password', hasError('password'), 'middle')}
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
              />
              {formErrors.password && touched.password && (
                <p className="mt-1 text-xs text-rose-600 px-1">{formErrors.password}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className={getInputClassName('confirmPassword', hasError('confirmPassword'), 'last')}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
              />
              {formErrors.confirmPassword && touched.confirmPassword && (
                <p className="mt-1 text-xs text-rose-600 px-1">{formErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onToggle}
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
