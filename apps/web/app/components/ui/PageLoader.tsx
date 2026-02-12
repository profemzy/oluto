export function PageLoader() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-200 rounded-full opacity-20 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-green-200 rounded-full opacity-20 blur-3xl animate-float-slow" />
      
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border-4 border-cyan-100" />
          <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
