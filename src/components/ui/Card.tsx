import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'medical' | 'interactive' | 'status';
  status?: 'low' | 'medium' | 'high' | 'critical';
  onClick?: () => void;
}

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  status,
  onClick 
}: CardProps) {
  const baseClasses = 'rounded-2xl border transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-white border-gray-200 shadow-sm',
    medical: 'bg-white border-gray-200 shadow-sm hover:shadow-md',
    interactive: 'bg-white border-gray-200 shadow-sm hover:shadow-lg hover:scale-[1.02] cursor-pointer',
    status: status ? `status-${status} border-2` : 'bg-white border-gray-200'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (onClick) {
    return (
      <div className={classes} onClick={onClick} role="button" tabIndex={0}>
        {children}
      </div>
    );
  }

  return <div className={classes}>{children}</div>;
}