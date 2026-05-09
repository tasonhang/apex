"use client"

import { useState } from "react"
import {
  Users,
  Calendar,
  MessageSquare,
  Home,
  Handshake,
  Settings,
  ChevronDown,
  ChevronRight,
  Mic,
  MicOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useApex } from "@/contexts/apex-context"
import { mockStats, mockLeads, mockAppointments, mockMessages, mockProperties, mockDeals } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarSectionProps {
  title: string
  icon: React.ReactNode
  badge?: number
  children: React.ReactNode
  defaultOpen?: boolean
}

function SidebarSection({ title, icon, badge, children, defaultOpen = false }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-sidebar-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{title}</span>
          {badge !== undefined && badge > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 min-w-5 rounded-full px-1.5 text-xs">
              {badge}
            </Badge>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="px-4 pb-3">{children}</div>}
    </div>
  )
}

interface ApexSidebarProps {
  onStartListening?: () => void
  onStopListening?: () => void
  isListening?: boolean
}

export function ApexSidebar({ onStartListening, onStopListening, isListening }: ApexSidebarProps) {
  const { assistantName, state } = useApex()

  return (
    <aside className="flex h-full w-72 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-3 w-3 rounded-full",
            state === "idle" && "bg-blue-500",
            state === "listening" && "bg-green-500 animate-pulse",
            state === "speaking" && "bg-amber-500 animate-pulse"
          )} />
          <h1 className="text-lg font-semibold text-sidebar-foreground">{assistantName}</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={isListening ? onStopListening : onStartListening}
          className={cn(
            "h-8 w-8",
            isListening && "text-green-500"
          )}
        >
          {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-2 p-4 border-b border-sidebar-border">
        <div className="rounded-lg bg-sidebar-accent p-3">
          <p className="text-xs text-muted-foreground">Active Leads</p>
          <p className="text-xl font-semibold text-sidebar-foreground">{mockStats.totalLeads}</p>
        </div>
        <div className="rounded-lg bg-sidebar-accent p-3">
          <p className="text-xs text-muted-foreground">Listings</p>
          <p className="text-xl font-semibold text-sidebar-foreground">{mockStats.activeListings}</p>
        </div>
        <div className="rounded-lg bg-sidebar-accent p-3">
          <p className="text-xs text-muted-foreground">Deals</p>
          <p className="text-xl font-semibold text-sidebar-foreground">{mockStats.dealsInProgress}</p>
        </div>
        <div className="rounded-lg bg-sidebar-accent p-3">
          <p className="text-xs text-muted-foreground">Messages</p>
          <p className="text-xl font-semibold text-sidebar-foreground">{mockStats.unreadMessages}</p>
        </div>
      </div>

      {/* Scrollable Sections */}
      <ScrollArea className="flex-1">
        <SidebarSection
          title="Leads"
          icon={<Users className="h-4 w-4" />}
          badge={mockStats.newLeadsThisWeek}
          defaultOpen
        >
          <div className="space-y-2">
            {mockLeads.slice(0, 3).map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between rounded-md bg-sidebar-accent/50 px-3 py-2 text-sm cursor-pointer hover:bg-sidebar-accent transition-colors"
              >
                <div>
                  <p className="font-medium text-sidebar-foreground">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">{lead.source}</p>
                </div>
                <Badge
                  variant={lead.status === "new" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {lead.status}
                </Badge>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-xs text-muted-foreground">
              View all leads
            </Button>
          </div>
        </SidebarSection>

        <SidebarSection
          title="Schedule"
          icon={<Calendar className="h-4 w-4" />}
          badge={mockStats.scheduledAppointments}
        >
          <div className="space-y-2">
            {mockAppointments.slice(0, 3).map((apt) => (
              <div
                key={apt.id}
                className="rounded-md bg-sidebar-accent/50 px-3 py-2 text-sm cursor-pointer hover:bg-sidebar-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sidebar-foreground">{apt.title}</p>
                  <span className="text-xs text-muted-foreground">{apt.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">{apt.clientName}</p>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-xs text-muted-foreground">
              View full schedule
            </Button>
          </div>
        </SidebarSection>

        <SidebarSection
          title="Messages"
          icon={<MessageSquare className="h-4 w-4" />}
          badge={mockStats.unreadMessages}
        >
          <div className="space-y-2">
            {mockMessages.slice(0, 3).map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-sidebar-accent transition-colors",
                  msg.read ? "bg-sidebar-accent/30" : "bg-sidebar-accent/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className={cn("font-medium text-sidebar-foreground", !msg.read && "font-semibold")}>
                    {msg.from}
                  </p>
                  <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{msg.subject}</p>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-xs text-muted-foreground">
              View all messages
            </Button>
          </div>
        </SidebarSection>

        <SidebarSection
          title="Properties"
          icon={<Home className="h-4 w-4" />}
          badge={mockStats.activeListings}
        >
          <div className="space-y-2">
            {mockProperties.slice(0, 3).map((prop) => (
              <div
                key={prop.id}
                className="rounded-md bg-sidebar-accent/50 px-3 py-2 text-sm cursor-pointer hover:bg-sidebar-accent transition-colors"
              >
                <p className="font-medium text-sidebar-foreground">{prop.address}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {prop.bedrooms}bd / {prop.bathrooms}ba
                  </span>
                  <span className="text-xs font-medium text-sidebar-foreground">
                    ${prop.price.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-xs text-muted-foreground">
              View all properties
            </Button>
          </div>
        </SidebarSection>

        <SidebarSection
          title="Deals"
          icon={<Handshake className="h-4 w-4" />}
          badge={mockStats.dealsInProgress}
        >
          <div className="space-y-2">
            {mockDeals.slice(0, 3).map((deal) => (
              <div
                key={deal.id}
                className="rounded-md bg-sidebar-accent/50 px-3 py-2 text-sm cursor-pointer hover:bg-sidebar-accent transition-colors"
              >
                <p className="font-medium text-sidebar-foreground">{deal.propertyAddress}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{deal.clientName}</span>
                  <Badge
                    variant={deal.status === "closing" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {deal.status}
                  </Badge>
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-xs text-muted-foreground">
              View all deals
            </Button>
          </div>
        </SidebarSection>

        <SidebarSection title="Settings" icon={<Settings className="h-4 w-4" />}>
          <div className="space-y-2">
            <Button variant="ghost" className="w-full justify-start text-sm">
              Voice Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              Notifications
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm">
              Account
            </Button>
          </div>
        </SidebarSection>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <p className="text-xs text-muted-foreground text-center">
          Say &quot;Wake up&quot; to activate voice commands
        </p>
      </div>
    </aside>
  )
}
