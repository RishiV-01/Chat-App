export default function LoadingSpinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-4',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-navy-200 border-t-navy-800 ${sizeClasses[size]}`} />
    </div>
  );
}
