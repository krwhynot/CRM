import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, Filter, Calendar, Users, Building, 
  Phone, Mail, MessageSquare, MapPin, AlertCircle 
} from 'lucide-react'

interface InteractionsFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  interactionCount: number
  totalCount?: number
}

export function InteractionsFilters({
  searchTerm,
  onSearchChange,
  interactionCount,
  totalCount,
}: InteractionsFiltersProps) {
  const showingFiltered = totalCount !== undefined && interactionCount !== totalCount

  return (
    <div className="space-y-4">
      {/* Search and Count */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-[350px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search interactions, contacts, organizations..."
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            {showingFiltered ? (
              <>
                <Badge variant="secondary">{interactionCount} shown</Badge>
                <Badge variant="outline">{totalCount} total</Badge>
              </>
            ) : (
              <Badge variant="secondary">{interactionCount} interactions</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="h-8">
          <Calendar className="h-3 w-3 mr-1" />
          Date Range
        </Button>
        <Button variant="outline" size="sm" className="h-8">
          <Filter className="h-3 w-3 mr-1" />
          Type
        </Button>
        <Button variant="outline" size="sm" className="h-8">
          <AlertCircle className="h-3 w-3 mr-1" />
          Follow-up Required
        </Button>
        <Button variant="outline" size="sm" className="h-8">
          <Users className="h-3 w-3 mr-1" />
          Contact
        </Button>
        <Button variant="outline" size="sm" className="h-8">
          <Building className="h-3 w-3 mr-1" />
          Organization
        </Button>
      </div>

      {/* Type Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          <Phone className="h-3 w-3 mr-1" />
          Calls
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          <Mail className="h-3 w-3 mr-1" />
          Emails
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          <Users className="h-3 w-3 mr-1" />
          Meetings
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          <MessageSquare className="h-3 w-3 mr-1" />
          Notes
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          <MapPin className="h-3 w-3 mr-1" />
          Site Visits
        </Button>
      </div>
    </div>
  )
}