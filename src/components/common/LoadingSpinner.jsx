export default function LoadingSpinner({ size = 'md', message = 'Cargando...' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizes[size]} mb-4`}></div>
      {message && <p className="text-gray-600">{message}</p>}
    </div>
  );
}