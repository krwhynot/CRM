import React from 'react'
import { semanticSpacing, semanticTypography, fontWeight } from '@/styles/tokens'

export const CRMDashboard: React.FC = () => {
  return (
    <div className="flex flex-1 flex-col">
      {/* Clean Empty Dashboard */}
      <div className={`flex-1 ${semanticSpacing.layoutPadding.xxl}`}>
        <div className={`mx-auto max-w-4xl ${semanticSpacing.stackContainer} text-center`}>
          <h1
            className={`${semanticTypography.heading} ${semanticTypography.h1} ${fontWeight.bold} text-foreground`}
          >
            Dashboard
          </h1>
          <p
            className={`${semanticTypography.heading} ${semanticTypography.title} text-muted-foreground`}
          >
            Welcome to your clean dashboard
          </p>
          <div className={`${semanticTypography.body} text-muted-foreground`}>
            Ready for fresh implementation
          </div>
        </div>
      </div>
    </div>
  )
}

export default CRMDashboard
