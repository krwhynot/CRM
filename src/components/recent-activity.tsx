import { Phone, Mail, MessageSquare, Building2, Target, User, Calendar } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

// Recent Interactions data with proper typing
const recentInteractions = [
  {
    type: "call",
    contact: "Mike Johnson",
    organization: "Gourmet Foods",
    time: "2 hours ago",
    status: "completed",
    icon: Phone,
  },
  {
    type: "email",
    contact: "Sarah Wilson",
    organization: "Farm Fresh",
    time: "1 day ago",
    status: "sent",
    icon: Mail,
  },
  {
    type: "follow-up",
    contact: "David Chen",
    organization: "Artisan Cheese",
    time: "2 days ago",
    status: "scheduled",
    icon: MessageSquare,
  },
  {
    type: "meeting",
    contact: "Jennifer Lopez",
    organization: "Organic Valley",
    time: "3 days ago",
    status: "completed",
    icon: Calendar,
  },
]

// Recently Added data with proper typing
const recentlyAdded = [
  {
    type: "organization",
    name: "Gourmet Bistro",
    category: "Organization",
    time: "1 day ago",
    status: "active",
    icon: Building2,
  },
  {
    type: "opportunity",
    name: "Premium Meats Deal",
    category: "Opportunity",
    time: "3 days ago",
    status: "new_lead",
    icon: Target,
  },
  {
    type: "contact",
    name: "Lisa Thompson",
    category: "Contact",
    time: "4 days ago",
    status: "active",
    icon: User,
  },
]

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "completed":
      return "default"
    case "sent":
      return "secondary"
    case "scheduled":
      return "outline"
    case "active":
      return "default"
    case "new_lead":
      return "secondary"
    default:
      return "outline"
  }
}

function InteractionsCard() {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Recent Interactions
          </CardTitle>
          <Select defaultValue="all">
            <SelectTrigger className="w-24 h-8 text-xs sm:h-9 touch-manipulation">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="call">Calls</SelectItem>
              <SelectItem value="email">Emails</SelectItem>
              <SelectItem value="meeting">Meetings</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <div className="space-y-3">
            {recentInteractions.map((interaction, index) => (
              <div key={index} className="flex items-start gap-3 p-3 sm:p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors touch-manipulation">
                <interaction.icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{interaction.contact}</p>
                    <Badge variant={getStatusBadgeVariant(interaction.status)} className="text-xs">
                      {interaction.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{interaction.organization}</p>
                  <p className="text-xs text-muted-foreground">{interaction.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function RecentlyAddedCard() {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recently Added
          </CardTitle>
          <Select defaultValue="all">
            <SelectTrigger className="w-32 h-8 text-xs sm:h-9 touch-manipulation">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="organization">Organizations</SelectItem>
              <SelectItem value="opportunity">Opportunities</SelectItem>
              <SelectItem value="contact">Contacts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <div className="space-y-3">
            {recentlyAdded.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 sm:p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors touch-manipulation">
                <item.icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <Badge variant={getStatusBadgeVariant(item.status)} className="text-xs">
                      {item.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export function RecentActivity() {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 laptop:grid-cols-2">
      <InteractionsCard />
      <RecentlyAddedCard />
    </div>
  )
}