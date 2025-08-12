import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  loading = false
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-medical';
  
  const variantClasses = {
    primary: 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300',
    success: 'bg-green-600 text-white hover:bg-green-700 shadow-md',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 shadow-md',
    error: 'bg-red-600 text-white hover:bg-red-700 shadow-md',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className="mr-2">🔄</span>}
      {children}
    </button>
  );
}