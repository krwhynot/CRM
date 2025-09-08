import { useState, useRef, useEffect } from 'react'
import { useChartData } from '../hooks/useChartData'
import { 
  ChartLoadingSkeleton, 
  OpportunitiesChart, 
  ActivityChart,
  WeeklyActivityChart,
  PrincipalPerformanceChart,
  TeamPerformanceChart,
  PipelineFlowChart,
  PipelineValueFunnel
} from './charts'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { WeeklyData } from '@/lib/date-utils'
import type { DashboardChartDataPoint } from '@/types/dashboard'

interface ChartsGridProps {
  // Legacy data interface (maintained for backward compatibility)
  data: WeeklyData[]
  isLoading?: boolean
  className?: string
  
  // Phase 5: New chart data
  opportunityChartData?: DashboardChartDataPoint[]
  interactionChartData?: DashboardChartDataPoint[]
  weeklyActivityData?: DashboardChartDataPoint[]
  principalPerformanceData?: Array<{
    name: string
    interactions: number
    performance: 'high' | 'medium' | 'low'
  }>
  teamPerformanceData?: Array<{
    name: string
    interactions: number
    opportunities: number
    movements: number
    rank: number
    isCurrentUser?: boolean
  }>
  
  // Pipeline chart data
  pipelineFlowData?: import('@/types/dashboard').PipelineFlowData
  pipelineValueFunnelData?: import('@/types/dashboard').PipelineValueFunnelData
  
  // Mobile carousel support
  enableMobileCarousel?: boolean
  
  // Chart visibility filtering
  visibleChartIds?: import('@/stores').ChartId[]
}

// Mock data generators for new charts (will be replaced with real data hooks)
const generatePrincipalData = () => [
  { name: 'Acme Corp', interactions: 45, performance: 'high' as const },
  { name: 'TechStart Inc', interactions: 32, performance: 'medium' as const },
  { name: 'Global Foods', interactions: 28, performance: 'medium' as const },
  { name: 'Quick Serve', interactions: 15, performance: 'low' as const },
  { name: 'Metro Dining', interactions: 38, performance: 'high' as const },
]

const generateTeamData = () => [
  { name: 'Alice Johnson', interactions: 25, opportunities: 8, movements: 12, rank: 1, isCurrentUser: true },
  { name: 'Bob Smith', interactions: 22, opportunities: 6, movements: 10, rank: 2 },
  { name: 'Carol Davis', interactions: 18, opportunities: 7, movements: 8, rank: 3 },
  { name: 'David Wilson', interactions: 15, opportunities: 4, movements: 6, rank: 4 },
]

export function ChartsGrid({ 
  data, 
  isLoading = false, 
  className,
  opportunityChartData,
  interactionChartData,
  weeklyActivityData,
  principalPerformanceData,
  teamPerformanceData,
  pipelineFlowData,
  pipelineValueFunnelData,
  enableMobileCarousel = true,
  visibleChartIds
}: ChartsGridProps) {
  const { chartData, maxOpportunities, maxActivities } = useChartData(data)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Carousel navigation
  const scrollToChart = (index: number) => {
    if (!scrollRef.current) return
    
    const chartWidth = scrollRef.current.children[0]?.clientWidth || 300
    const scrollPosition = index * (chartWidth + 16) // 16px gap
    
    scrollRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    })
    setCurrentIndex(index)
  }

  const handlePrevious = () => {
    const newIndex = Math.max(0, currentIndex - 1)
    scrollToChart(newIndex)
  }

  const handleNext = () => {
    const totalCharts = charts.length // Use actual chart count after filtering
    const newIndex = Math.min(totalCharts - 1, currentIndex + 1)
    scrollToChart(newIndex)
  }

  // Transform DashboardChartDataPoint to ChartDataPoint format for existing charts
  const transformToChartData = (dashboardData: DashboardChartDataPoint[]) => {
    return dashboardData.map(item => ({
      weekLabel: item.week,
      weekStart: item.weekStart,
      weekEnd: new Date(item.weekStart.getTime() + 6 * 24 * 60 * 60 * 1000), // Add 6 days
      weekNumber: Math.ceil((item.weekStart.getTime() - new Date(item.weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
      opportunities: item.count,
      interactions: Math.floor(item.count * 0.7) // 70% interaction ratio
    }))
  }

  // Use provided data or fall back to existing/mock data
  const finalOpportunityData = opportunityChartData ? transformToChartData(opportunityChartData) : chartData
  const finalInteractionData = interactionChartData ? transformToChartData(interactionChartData) : chartData
  const finalWeeklyActivityData = weeklyActivityData || chartData
  const finalPrincipalData = principalPerformanceData || generatePrincipalData()
  const finalTeamData = teamPerformanceData || generateTeamData()

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 ${className || ''}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <ChartLoadingSkeleton key={index} />
        ))}
      </div>
    )
  }

  // Charts array for consistent rendering
  const allCharts = [
    {
      id: 'weekly-activity' as import('@/stores').ChartId,
      title: "Weekly Activity",
      colorClass: "bg-chart-1",
      data: finalWeeklyActivityData,
      component: <WeeklyActivityChart data={finalWeeklyActivityData} loading={false} />
    },
    {
      id: 'principal-performance' as import('@/stores').ChartId,
      title: "Principal Performance",
      colorClass: "bg-chart-2", 
      data: finalPrincipalData,
      component: <PrincipalPerformanceChart 
        data={finalPrincipalData} 
        loading={false}
        onPrincipalClick={(principal) => console.log('Navigate to principal:', principal)}
      />
    },
    {
      id: 'team-performance' as import('@/stores').ChartId,
      title: "Team Performance",
      colorClass: "bg-chart-3",
      data: finalTeamData,
      component: <TeamPerformanceChart 
        data={finalTeamData} 
        loading={false}
        showUserHighlight={true}
      />
    },
    {
      id: 'opportunities' as import('@/stores').ChartId,
      title: "Opportunities",
      colorClass: "bg-primary",
      data: finalOpportunityData,
      component: <OpportunitiesChart data={finalOpportunityData} maxValue={maxOpportunities} />
    },
    {
      id: 'activities' as import('@/stores').ChartId,
      title: "Activities", 
      colorClass: "bg-success",
      data: finalInteractionData,
      component: <ActivityChart data={finalInteractionData} maxValue={maxActivities} />
    },
    {
      id: 'pipeline-flow' as import('@/stores').ChartId,
      title: "Pipeline Flow",
      colorClass: "bg-chart-4",
      data: pipelineFlowData || [],
      component: <PipelineFlowChart data={pipelineFlowData} loading={false} />
    },
    {
      id: 'pipeline-funnel' as import('@/stores').ChartId,
      title: "Pipeline Funnel",
      colorClass: "bg-chart-5",
      data: pipelineValueFunnelData || [],
      component: <PipelineValueFunnel data={pipelineValueFunnelData} loading={false} showValues={true} />
    }
  ]

  // Filter charts based on visibility (if visibleChartIds is provided)
  const charts = visibleChartIds 
    ? allCharts.filter(chart => visibleChartIds.includes(chart.id))
    : allCharts

  // Mobile carousel view
  if (isMobile && enableMobileCarousel) {
    return (
      <div className="relative">
        {/* Carousel Navigation */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Charts ({currentIndex + 1} of {charts.length})</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex === charts.length - 1}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth"
            style={{ 
              scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // Internet Explorer
            }}
          >
            {charts.map((chart) => (
              <div
                key={chart.id}
                className="min-w-full shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                {chart.component}
              </div>
            ))}
          </div>
        </div>

        {/* Indicators */}
        <div className="mt-4 flex justify-center gap-2">
          {charts.map((_, index) => (
            <button
              key={index}
              className={`size-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
              onClick={() => scrollToChart(index)}
            />
          ))}
        </div>
      </div>
    )
  }

  // Desktop/tablet grid view
  return (
    <div className={`grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 ${className || ''}`}>
      {charts.map((chart) => (
        <div key={chart.id}>
          {chart.component}
        </div>
      ))}
    </div>
  )
}

// Re-export for backward compatibility
export { DualChartsEmpty as ChartsGridEmpty } from './charts/DualChartsEmpty'