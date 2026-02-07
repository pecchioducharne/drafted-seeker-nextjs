/**
 * StatCards Component
 * Displays summary analytics cards for the dashboard
 */

export default function StatCards({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="liquid-glass rounded-xl p-6 animate-pulse"
          >
            <div className="h-4 bg-white/10 rounded w-2/3 mb-3"></div>
            <div className="h-8 bg-white/10 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Candidates Card */}
      <div className="liquid-glass rounded-xl p-6 hover:bg-white/5 transition-colors">
        <div className="text-gray-400 text-sm font-medium mb-2">
          Total Candidates
        </div>
        <div className="text-3xl font-bold text-white">
          {stats.totalWithVideo.toLocaleString()}
        </div>
        <div className="text-gray-400 text-xs mt-1">
          with video recorded
        </div>
      </div>

      {/* Universities Card */}
      <div className="liquid-glass rounded-xl p-6 hover:bg-white/5 transition-colors">
        <div className="text-gray-400 text-sm font-medium mb-2">
          Universities
        </div>
        <div className="text-3xl font-bold text-white">
          {stats.totalUniversities}
        </div>
        <div className="text-gray-400 text-xs mt-1">
          institutions represented
        </div>
      </div>

      {/* Top Major Card */}
      <div className="liquid-glass rounded-xl p-6 hover:bg-white/5 transition-colors">
        <div className="text-gray-400 text-sm font-medium mb-2">
          Top Major
        </div>
        <div className="text-xl font-bold text-white truncate">
          {stats.topMajors[0]?.major || 'N/A'}
        </div>
        <div className="text-gray-400 text-xs mt-1">
          {stats.topMajors[0]?.count || 0} candidates
        </div>
      </div>

      {/* Avg Videos Card */}
      <div className="liquid-glass rounded-xl p-6 hover:bg-white/5 transition-colors">
        <div className="text-gray-400 text-sm font-medium mb-2">
          Avg Videos
        </div>
        <div className="text-3xl font-bold text-white">
          {stats.avgVideosPerCandidate.toFixed(1)}
        </div>
        <div className="text-gray-400 text-xs mt-1">
          per candidate
        </div>
      </div>

      {/* Top Programming Language Card */}
      <div className="liquid-glass rounded-xl p-6 hover:bg-white/5 transition-colors">
        <div className="text-gray-400 text-sm font-medium mb-2">
          Top Programming Language
        </div>
        <div className="text-xl font-bold text-white truncate">
          {stats.topProgrammingLanguages[0]?.language || 'N/A'}
        </div>
        <div className="text-gray-400 text-xs mt-1">
          {stats.topProgrammingLanguages[0]?.count || 0} candidates
        </div>
      </div>

      {/* Top Culture Tag Card */}
      <div className="liquid-glass rounded-xl p-6 hover:bg-white/5 transition-colors">
        <div className="text-gray-400 text-sm font-medium mb-2">
          Top Culture Tag
        </div>
        <div className="text-xl font-bold text-white truncate">
          {stats.topCultureTags[0]?.tag || 'N/A'}
        </div>
        <div className="text-gray-400 text-xs mt-1">
          {stats.topCultureTags[0]?.count || 0} candidates
        </div>
      </div>

      {/* Top 5 Majors Detailed Card (spans 2 columns) */}
      <div className="liquid-glass rounded-xl p-6 hover:bg-white/5 transition-colors lg:col-span-2">
        <div className="text-gray-400 text-sm font-medium mb-3">
          Top 5 Majors
        </div>
        <div className="space-y-2">
          {stats.topMajors.slice(0, 5).map((item, index) => (
            <div key={item.major} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-bold">{index + 1}.</span>
                <span className="text-white text-sm truncate max-w-[200px]">
                  {item.major}
                </span>
              </div>
              <span className="text-gray-400 text-sm">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
