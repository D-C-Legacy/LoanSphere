export const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-lg shadow-lg p-6">
    <div className="flex justify-between items-start mb-4">
      <div className="h-6 bg-gray-200 rounded w-20"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-16 bg-gray-200 rounded mb-4"></div>
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="h-12 bg-gray-200 rounded"></div>
      <div className="h-12 bg-gray-200 rounded"></div>
    </div>
    <div className="h-10 bg-gray-200 rounded"></div>
  </div>
);

export const SkeletonList = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);