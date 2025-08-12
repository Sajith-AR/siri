interface StatusBadgeProps {
  status: 'low' | 'medium' | 'high' | 'critical' | 'normal' | 'good' | 'excellent';
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, text, size = 'md' }: StatusBadgeProps) {
  const statusConfig = {
    low: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: '✓' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: '⚠' },
    high: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: '⚠' },
    critical: { bg: 'bg-red-200', text: 'text-red-900', border: 'border-red-300', icon: '🚨' },
    normal: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', icon: '✓' },
    good: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: '✓' },
    excellent: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', icon: '⭐' }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const config = statusConfig[status];
  const displayText = text || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}>
      <span>{config.icon}</span>
      {displayText}
    </span>
  );
}