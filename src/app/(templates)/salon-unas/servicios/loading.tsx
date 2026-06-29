export default function ServiciosLoading() {
  return (
    <div className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <div className="h-9 w-48 bg-[#f0f0f0] rounded-xl mx-auto mb-3 animate-pulse" />
          <div className="h-4 w-64 bg-[#f0f0f0] rounded-lg mx-auto animate-pulse" />
        </div>
        <div className="max-w-xl mx-auto mb-10">
          <div className="h-12 rounded-full bg-[#f0f0f0] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#ebebeb] overflow-hidden">
              <div className="h-44 bg-[#f0f0f0] animate-pulse" />
              <div className="p-5 space-y-2">
                <div className="h-4 bg-[#f0f0f0] rounded-lg w-3/4 animate-pulse" />
                <div className="h-3 bg-[#f0f0f0] rounded-lg animate-pulse" />
                <div className="h-3 bg-[#f0f0f0] rounded-lg w-5/6 animate-pulse" />
                <div className="flex justify-between items-center pt-3 border-t border-[#ebebeb]">
                  <div className="h-6 w-16 bg-[#f0f0f0] rounded-lg animate-pulse" />
                  <div className="h-8 w-24 bg-[#f0f0f0] rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
