// Mock data for APEX - will be replaced with Supabase later

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  status: "new" | "contacted" | "qualified" | "lost"
  source: string
  createdAt: string
  notes?: string
}

export interface Appointment {
  id: string
  title: string
  clientName: string
  date: string
  time: string
  location: string
  type: "viewing" | "meeting" | "call" | "other"
  notes?: string
}

export interface Message {
  id: string
  from: string
  subject: string
  preview: string
  timestamp: string
  read: boolean
}

export interface Property {
  id: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number
  status: "active" | "pending" | "sold"
  image?: string
}

export interface Deal {
  id: string
  propertyAddress: string
  clientName: string
  amount: number
  status: "negotiation" | "pending" | "closing" | "closed"
  closingDate?: string
}

export const mockLeads: Lead[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "(555) 123-4567",
    status: "new",
    source: "Website",
    createdAt: "2024-01-15",
    notes: "Interested in downtown properties"
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "(555) 234-5678",
    status: "contacted",
    source: "Referral",
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "m.brown@email.com",
    phone: "(555) 345-6789",
    status: "qualified",
    source: "Open House",
    createdAt: "2024-01-12",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.d@email.com",
    phone: "(555) 456-7890",
    status: "new",
    source: "Website",
    createdAt: "2024-01-10",
  },
]

export const mockAppointments: Appointment[] = [
  {
    id: "1",
    title: "Property Viewing",
    clientName: "Sarah Johnson",
    date: "2024-01-16",
    time: "2:00 PM",
    location: "123 Oak Street",
    type: "viewing",
  },
  {
    id: "2",
    title: "Contract Discussion",
    clientName: "Michael Brown",
    date: "2024-01-16",
    time: "4:30 PM",
    location: "Office",
    type: "meeting",
  },
  {
    id: "3",
    title: "Follow-up Call",
    clientName: "John Smith",
    date: "2024-01-17",
    time: "10:00 AM",
    location: "Phone",
    type: "call",
  },
]

export const mockMessages: Message[] = [
  {
    id: "1",
    from: "John Smith",
    subject: "Re: Downtown Condo",
    preview: "Thank you for sending the details. I would like to schedule a viewing...",
    timestamp: "10 min ago",
    read: false,
  },
  {
    id: "2",
    from: "Sarah Johnson",
    subject: "Viewing Confirmation",
    preview: "Just confirming our appointment tomorrow at 2 PM...",
    timestamp: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    from: "Michael Brown",
    subject: "Contract Questions",
    preview: "I have a few questions about the contract terms...",
    timestamp: "2 hours ago",
    read: true,
  },
  {
    id: "4",
    from: "Emily Davis",
    subject: "Looking for 3BR homes",
    preview: "Hi, I am looking for 3 bedroom homes in the Oak Park area...",
    timestamp: "Yesterday",
    read: false,
  },
  {
    id: "5",
    from: "Agent Portal",
    subject: "Weekly Report Available",
    preview: "Your weekly performance report is now available...",
    timestamp: "2 days ago",
    read: true,
  },
]

export const mockProperties: Property[] = [
  {
    id: "1",
    address: "123 Oak Street",
    price: 450000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1850,
    status: "active",
  },
  {
    id: "2",
    address: "456 Maple Avenue",
    price: 575000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2400,
    status: "active",
  },
  {
    id: "3",
    address: "789 Pine Road",
    price: 325000,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1200,
    status: "pending",
  },
  {
    id: "4",
    address: "321 Cedar Lane",
    price: 680000,
    bedrooms: 5,
    bathrooms: 3,
    sqft: 3100,
    status: "active",
  },
]

export const mockDeals: Deal[] = [
  {
    id: "1",
    propertyAddress: "789 Pine Road",
    clientName: "Michael Brown",
    amount: 320000,
    status: "closing",
    closingDate: "2024-01-20",
  },
  {
    id: "2",
    propertyAddress: "555 Elm Street",
    clientName: "Lisa Wilson",
    amount: 425000,
    status: "pending",
    closingDate: "2024-01-25",
  },
  {
    id: "3",
    propertyAddress: "777 Birch Court",
    clientName: "Robert Taylor",
    amount: 550000,
    status: "negotiation",
  },
  {
    id: "4",
    propertyAddress: "999 Willow Way",
    clientName: "Jennifer Lee",
    amount: 380000,
    status: "closing",
    closingDate: "2024-01-22",
  },
]

export const mockStats = {
  totalLeads: 12,
  newLeadsThisWeek: 4,
  activeListings: 8,
  dealsInProgress: 4,
  scheduledAppointments: 3,
  unreadMessages: 5,
  totalRevenue: 1675000,
  closedDealsThisMonth: 2,
}
