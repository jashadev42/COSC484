export function LoadingWheel() {
  return (
    <div className="w-full h-full flex items-center justify-center text-white">
      <div className="text-center space-y-4">
        <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-neutral-400 text-xs">Loading...</p>
      </div>
    </div>
  );
}