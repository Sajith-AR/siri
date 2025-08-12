// Clean Healthcare Design System Components
import React from 'react';

// Input Component with proper styling
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
  }
>(({ className, type, label, error, ...props }, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`
          w-full px-4 py-3 
          bg-white text-gray-900 
          border-2 border-gray-200 
          rounded-xl 
          focus:border-teal-500 focus:ring-0 focus:outline-none
          placeholder:text-gray-500
          transition-colors duration-200
          ${error ? 'border-red-300 focus:border-red-500' : ''}
          ${className || ''}
        `}
        ref={ref}
        {...props}
        style={{ 
          backgroundColor: '#ffffff !important', 
          color: '#1f2937 !important',
          ...props.style 
        }}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});
Input.displayName = "Input";

// Textarea Component
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    error?: string;
  }
>(({ className, label, error, ...props }, ref) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-3 
          bg-white text-gray-900 
          border-2 border-gray-200 
          rounded-xl 
          focus:border-teal-500 focus:ring-0 focus:outline-none
          placeholder:text-gray-500
          transition-colors duration-200
          resize-none
          ${error ? 'border-red-300 focus:border-red-500' : ''}
          ${className || ''}
        `}
        ref={ref}
        {...props}
        style={{ 
          backgroundColor: '#ffffff !important', 
          color: '#1f2937 !important',
          ...props.style 
        }}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});
Textarea.displayName = "Textarea";

// Button Component
export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
  }
>(({ className, variant = 'primary', size = 'md', loading, children, ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 focus:ring-teal-500 shadow-lg hover:shadow-xl",
    secondary: "bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-teal-300 focus:ring-teal-500",
    success: "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-500 shadow-lg",
    warning: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 focus:ring-yellow-500 shadow-lg",
    error: "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus:ring-red-500 shadow-lg"
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:transform hover:scale-105'}
        ${className || ''}
      `}
      disabled={loading}
      ref={ref}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
});
Button.displayName = "Button";

// Card Component
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'medical' | 'success' | 'warning' | 'error';
    interactive?: boolean;
  }
>(({ className, variant = 'default', interactive = false, children, ...props }, ref) => {
  const baseClasses = "rounded-2xl border shadow-sm transition-all duration-200";
  
  const variants = {
    default: "bg-white border-gray-200",
    medical: "bg-gradient-to-br from-white to-blue-50 border-blue-200",
    success: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
    warning: "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200",
    error: "bg-gradient-to-br from-red-50 to-pink-50 border-red-200"
  };

  return (
    <div
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${interactive ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer' : 'hover:shadow-md'}
        ${className || ''}
      `}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = "Card";

// Badge Component
export const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  }
>(({ className, variant = 'default', children, ...props }, ref) => {
  const variants = {
    default: "bg-gray-100 text-gray-700 border-gray-200",
    success: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
    error: "bg-red-100 text-red-700 border-red-200",
    info: "bg-blue-100 text-blue-700 border-blue-200"
  };

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border
        ${variants[variant]}
        ${className || ''}
      `}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  );
});
Badge.displayName = "Badge";

// Alert Component
export const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    title?: string;
  }
>(({ className, variant = 'default', title, children, ...props }, ref) => {
  const variants = {
    default: "bg-gray-50 border-gray-200 text-gray-700",
    success: "bg-green-50 border-green-200 text-green-700",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
    error: "bg-red-50 border-red-200 text-red-700",
    info: "bg-blue-50 border-blue-200 text-blue-700"
  };

  const icons = {
    default: "ℹ️",
    success: "✅",
    warning: "⚠️",
    error: "❌",
    info: "💡"
  };

  return (
    <div
      className={`
        p-4 rounded-xl border-2
        ${variants[variant]}
        ${className || ''}
      `}
      ref={ref}
      {...props}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{icons[variant]}</span>
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
});
Alert.displayName = "Alert";

// Loading Spinner
export const Spinner = ({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-teal-600 ${sizes[size]} ${className || ''}`} />
  );
};

// Container Component
export const Container = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className || ''}`}>
      {children}
    </div>
  );
};

// Section Component
export const Section = ({ 
  children, 
  className, 
  background = 'default' 
}: { 
  children: React.ReactNode; 
  className?: string;
  background?: 'default' | 'muted' | 'gradient';
}) => {
  const backgrounds = {
    default: 'bg-white',
    muted: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-gray-50 via-white to-blue-50'
  };

  return (
    <section className={`py-12 ${backgrounds[background]} ${className || ''}`}>
      {children}
    </section>
  );
};