export default function GaleriaLoading() {
  return (
    <div className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <div className="h-9 w-32 bg-[#f0f0f0] rounded-xl mx-auto mb-3 animate-pulse" />
          <div className="h-4 w-56 bg-[#f0f0f0] rounded-lg mx-auto animate-pulse" />
        </div>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#f0f0f0] rounded-xl animate-pulse break-inside-avoid"
              style={{ height: `${140 + (i % 3) * 40}px` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
