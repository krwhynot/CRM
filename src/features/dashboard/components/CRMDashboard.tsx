import React from 'react'

export const CRMDashboard: React.FC = () => {
  return (
    <div className="flex flex-1 flex-col">
      {/* Clean Empty Dashboard */}
      <div className="flex-1 p-8">
        <div className="mx-auto max-w-4xl space-y-6 text-center">
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xl text-muted-foreground">Welcome to your clean dashboard</p>
          <div className="text-sm text-muted-foreground">Ready for fresh implementation</div>
        </div>
      </div>
    </div>
  )
}

export default CRMDashboard
