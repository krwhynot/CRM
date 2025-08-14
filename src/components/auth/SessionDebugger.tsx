import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

/**
 * Development-only component for debugging session issues
 * Add this component temporarily to any page to debug authentication problems
 */
export function SessionDebugger() {
  const { user, session, debugSessionData, clearAllSessionData } = useAuth()

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-red-50 border-red-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-red-700">🔧 Session Debugger</CardTitle>
        <CardDescription className="text-xs text-red-600">
          Development only - Remove before production
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs space-y-1">
          <div>
            <strong>User:</strong> {user?.email || 'Not authenticated'}
          </div>
          <div>
            <strong>Session:</strong> {session ? 'Active' : 'None'}
          </div>
          {session && (
            <div>
              <strong>Expires:</strong> {new Date(session.expires_at! * 1000).toLocaleTimeString()}
            </div>
          )}
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <Button 
            onClick={debugSessionData}
            variant="outline" 
            size="sm"
            className="w-full text-xs"
          >
            🔍 Debug Session Data
          </Button>
          
          <Button 
            onClick={clearAllSessionData}
            variant="destructive" 
            size="sm"
            className="w-full text-xs"
          >
            🧹 Force Clear All Session Data
          </Button>
        </div>
        
        <div className="text-xs text-red-600">
          Check browser console for detailed logs
        </div>
      </CardContent>
    </Card>
  )
}