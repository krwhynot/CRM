import { useState } from "react"
import { Button } from "@/components/ui/button"

// Sample chart data
const chartData = [
  { week: 'W1', height: 80, segments: [
    { id: 1, height: 25, color: 'bg-[hsl(95_71%_56%)]' },
    { id: 2, height: 25, color: 'bg-[hsl(95_60%_65%)]' },
    { id: 3, height: 25, color: 'bg-[hsl(95_50%_50%)]' },
    { id: 4, height: 25, color: 'bg-[hsl(160_40%_55%)]' }
  ]},
  { week: 'W2', height: 60, segments: [
    { id: 1, height: 30, color: 'bg-[hsl(95_71%_56%)]' },
    { id: 2, height: 35, color: 'bg-[hsl(95_60%_65%)]' },
    { id: 3, height: 35, color: 'bg-[hsl(95_50%_50%)]' }
  ]},
  { week: 'W3', height: 90, segments: [
    { id: 1, height: 20, color: 'bg-[hsl(95_71%_56%)]' },
    { id: 2, height: 30, color: 'bg-[hsl(95_60%_65%)]' },
    { id: 3, height: 25, color: 'bg-[hsl(95_50%_50%)]' },
    { id: 4, height: 25, color: 'bg-[hsl(160_40%_55%)]' }
  ]},
  { week: 'W4', height: 70, segments: [
    { id: 1, height: 28, color: 'bg-[hsl(95_71%_56%)]' },
    { id: 2, height: 28, color: 'bg-[hsl(95_60%_65%)]' },
    { id: 3, height: 22, color: 'bg-[hsl(95_50%_50%)]' },
    { id: 5, height: 22, color: 'bg-[hsl(110_30%_45%)]' }
  ]},
  { week: 'W5', height: 85, segments: [
    { id: 1, height: 24, color: 'bg-[hsl(95_71%_56%)]' },
    { id: 2, height: 24, color: 'bg-[hsl(95_60%_65%)]' },
    { id: 3, height: 18, color: 'bg-[hsl(95_50%_50%)]' },
    { id: 4, height: 18, color: 'bg-[hsl(160_40%_55%)]' },
    { id: 5, height: 16, color: 'bg-[hsl(110_30%_45%)]' }
  ]},
  { week: 'W6', height: 65, segments: [
    { id: 1, height: 31, color: 'bg-[hsl(95_71%_56%)]' },
    { id: 2, height: 31, color: 'bg-[hsl(95_60%_65%)]' },
    { id: 3, height: 38, color: 'bg-[hsl(95_50%_50%)]' }
  ]},
  { week: 'W7', height: 75, segments: [
    { id: 1, height: 27, color: 'bg-[hsl(95_71%_56%)]' },
    { id: 2, height: 27, color: 'bg-[hsl(95_60%_65%)]' },
    { id: 3, height: 23, color: 'bg-[hsl(95_50%_50%)]' },
    { id: 4, height: 23, color: 'bg-[hsl(160_40%_55%)]' }
  ]},
  { week: 'W8', height: 95, segments: [
    { id: 1, height: 21, color: 'bg-[hsl(95_71%_56%)]' },
    { id: 2, height: 21, color: 'bg-[hsl(95_60%_65%)]' },
    { id: 3, height: 21, color: 'bg-[hsl(95_50%_50%)]' },
    { id: 4, height: 19, color: 'bg-[hsl(160_40%_55%)]' },
    { id: 5, height: 18, color: 'bg-[hsl(110_30%_45%)]' }
  ]}
]

const legendItems = [
  { id: 1, color: 'bg-[hsl(95_71%_56%)]', name: 'Artisan Cheese' },
  { id: 2, color: 'bg-[hsl(95_60%_65%)]', name: 'Farm Fresh' },
  { id: 3, color: 'bg-[hsl(95_50%_50%)]', name: 'Specialty' },
  { id: 4, color: 'bg-[hsl(160_40%_55%)]', name: 'Organic Produce' },
  { id: 5, color: 'bg-[hsl(110_30%_45%)]', name: 'Premium Meats' }
]

const yAxisLabels = ['15', '12', '9', '6', '3', '0']

export function ChartCard() {
  const [activeView, setActiveView] = useState('interactions')
  const [activePeriod, setActivePeriod] = useState('Last 8 Weeks')
  
  // Feature flag for new MFB compact styling (default: enabled, opt-out with 'false')
  const USE_NEW_STYLE = localStorage.getItem('useNewStyle') !== 'false';

  return (
    <div className={`bg-white rounded-lg shadow-[0_4px_12px_rgba(141,198,63,0.1)] border-t-3 border-t-primary-500 ${USE_NEW_STYLE ? "p-4" : "p-6"}`}>
      {/* Chart Header */}
      <div className={`flex justify-between items-center ${USE_NEW_STYLE ? "mb-3" : "mb-4"}`}>
        <h2 className={`flex items-center gap-2 ${USE_NEW_STYLE ? "text-sm font-bold text-[hsl(var(--foreground))]" : "text-base font-semibold text-gray-900"}`}>
          📈 WEEKLY ACTIVITY OVERVIEW
        </h2>
        <div className="flex gap-2">
          <Button 
            variant={activeView === 'interactions' ? 'default' : 'outline'}
            size="sm"
            className={`px-3 py-1 text-xs ${activeView === 'interactions' 
              ? 'bg-primary text-white shadow-[0_2px_4px_rgba(141,198,63,0.2)]' 
              : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
            }`}
            onClick={() => setActiveView('interactions')}
          >
            Interactions
          </Button>
          <Button 
            variant={activeView === 'opportunities' ? 'default' : 'outline'}
            size="sm"
            className={`px-3 py-1 text-xs ${activeView === 'opportunities' 
              ? 'bg-primary text-white shadow-[0_2px_4px_rgba(141,198,63,0.2)]' 
              : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
            }`}
            onClick={() => setActiveView('opportunities')}
          >
            Opportunities
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="px-3 py-1 text-xs bg-gray-100 border-gray-300 hover:bg-gray-200"
            onClick={() => setActivePeriod(activePeriod === 'Last 8 Weeks' ? 'Last 4 Weeks' : 'Last 8 Weeks')}
          >
            {activePeriod}
          </Button>
        </div>
      </div>

      {/* Chart Area */}
      <div className={`relative ${USE_NEW_STYLE ? "h-[280px] mb-3" : "h-[300px] mb-4"}`}>
        <div className={`flex items-end justify-around px-4 border-l-2 border-b-2 border-gray-300 relative ${USE_NEW_STYLE ? "h-[230px]" : "h-[250px]"}`}>
          {/* Y-axis labels */}
          <div className="absolute -left-8 top-0 h-full flex flex-col justify-between text-[11px] text-gray-500 font-mono">
            {yAxisLabels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>

          {/* Chart Bars */}
          {chartData.map((week) => (
            <div key={week.week} className="flex-1 flex flex-col items-center justify-end relative mx-2">
              <div 
                className="w-full flex flex-col justify-end relative transition-all duration-150"
                style={{ height: `${week.height}%` }}
              >
                {week.segments.map((segment, segmentIndex) => (
                  <div
                    key={segmentIndex}
                    className={`w-full ${segment.color} transition-all duration-150 cursor-pointer hover:opacity-80 hover:-translate-y-0.5`}
                    style={{ height: `${segment.height}%` }}
                    title={`${legendItems.find(l => l.id === segment.id)?.name}: ${Math.ceil(segment.height * week.height / 100 * 15 / 100)} ${activeView}`}
                  />
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-600 font-medium">{week.week}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Legend */}
      <div className={`flex flex-wrap gap-4 border-t border-gray-200 ${USE_NEW_STYLE ? "pt-3" : "pt-4"}`}>
        {legendItems.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => console.log(`Toggle ${item.name}`)}
          >
            <div className={`w-4 h-4 ${item.color} rounded-sm`} />
            <span className="text-sm text-gray-700">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}