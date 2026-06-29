export default function OpinionesLoading() {
  return (
    <div className="py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <div className="h-9 w-64 bg-[#f0f0f0] rounded-xl mx-auto mb-3 animate-pulse" />
          <div className="h-6 w-40 bg-[#f0f0f0] rounded-lg mx-auto animate-pulse" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-[#ebebeb]">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, s) => (
                  <div key={s} className="w-3.5 h-3.5 bg-[#f0f0f0] rounded-sm animate-pulse" />
                ))}
              </div>
              <div className="space-y-1.5 mb-4">
                <div className="h-3 bg-[#f0f0f0] rounded animate-pulse" />
                <div className="h-3 bg-[#f0f0f0] rounded animate-pulse w-5/6" />
                <div className="h-3 bg-[#f0f0f0] rounded animate-pulse w-4/5" />
              </div>
              <div className="h-4 w-28 bg-[#f0f0f0] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
