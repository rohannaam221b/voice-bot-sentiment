import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Search, Plus, Eye, Calendar, User } from 'lucide-react';

interface Ticket {
  ticketId: string;
  issueCategory: string;
  priority: 'high' | 'medium' | 'low';
  status: 'new' | 'in-progress' | 'escalated' | 'resolved';
  assignedAgent?: string;
  createdTime: string;
  customerName: string;
  accountNumber: string;
  contactInfo: string;
  issueDescription: string;
  sentimentScore: number;
  followupRequired: boolean;
  followupDate?: string;
}

export function TicketGenerationDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      ticketId: 'TKT-2024-0015',
      issueCategory: 'UPI Issues',
      priority: 'high',
      status: 'new',
      createdTime: '2024-01-15 14:30:22',
      customerName: 'Rajesh Kumar',
      accountNumber: '****7892',
      contactInfo: '+91 98765 43210',
      issueDescription: 'UPI transaction failed but amount was deducted. Transaction ID: UPI2024011514301234. Amount: ₹2,500 to merchant PayTM_Grocery.',
      sentimentScore: 25,
      followupRequired: true,
      followupDate: '2024-01-16'
    },
    {
      ticketId: 'TKT-2024-0014',
      issueCategory: 'Account Queries',
      priority: 'medium',
      status: 'in-progress',
      assignedAgent: 'Agent Sarah M.',
      createdTime: '2024-01-15 14:25:15',
      customerName: 'Priya Sharma',
      accountNumber: '****5643',
      contactInfo: '+91 87654 32109',
      issueDescription: 'Customer inquired about new credit card application status and eligibility for premium banking services.',
      sentimentScore: 70,
      followupRequired: false
    },
    {
      ticketId: 'TKT-2024-0013',
      issueCategory: 'Card Problems',
      priority: 'high',
      status: 'escalated',
      assignedAgent: 'Agent Mike R.',
      createdTime: '2024-01-15 14:20:08',
      customerName: 'Arjun Patel',
      accountNumber: '****9876',
      contactInfo: '+91 76543 21098',
      issueDescription: 'Debit card blocked due to suspicious activity. Customer traveling abroad and needs immediate card activation.',
      sentimentScore: 35,
      followupRequired: true,
      followupDate: '2024-01-15'
    },
    {
      ticketId: 'TKT-2024-0012',
      issueCategory: 'General Banking',
      priority: 'low',
      status: 'resolved',
      assignedAgent: 'Agent Lisa K.',
      createdTime: '2024-01-15 14:15:33',
      customerName: 'Meera Reddy',
      accountNumber: '****3421',
      contactInfo: '+91 65432 10987',
      issueDescription: 'Customer requested information about fixed deposit rates and terms. Provided complete details and brochure.',
      sentimentScore: 85,
      followupRequired: false
    },
    {
      ticketId: 'TKT-2024-0011',
      issueCategory: 'Loan Services',
      priority: 'medium',
      status: 'in-progress',
      assignedAgent: 'Agent John D.',
      createdTime: '2024-01-15 14:10:12',
      customerName: 'Suresh Gupta',
      accountNumber: '****8765',
      contactInfo: '+91 54321 09876',
      issueDescription: 'Home loan pre-approval request. Customer provided all documents and awaiting credit assessment completion.',
      sentimentScore: 60,
      followupRequired: true,
      followupDate: '2024-01-18'
    }
  ]);

  // Auto-generate ticket based on real-time conversation
  useEffect(() => {
    const timer = setTimeout(() => {
      const newTicket: Ticket = {
        ticketId: 'TKT-2024-0016',
        issueCategory: 'UPI Issues',
        priority: 'high',
        status: 'new',
        createdTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        customerName: 'Rajesh Kumar',
        accountNumber: '****7892',
        contactInfo: '+91 98765 43210',
        issueDescription: 'LIVE CALL: UPI transaction failed but amount was deducted. Transaction ID: UPI2024011514301234. Amount: ₹2,500 to merchant PayTM_Grocery. Customer expressing high frustration and urgency. Refund initiated with reference REF-UPI-2024-001234.',
        sentimentScore: 25,
        followupRequired: true,
        followupDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10) // Tomorrow
      };

      setTickets(prev => [newTicket, ...prev]);
    }, 15000); // Generate ticket 15 seconds after dashboard loads

    return () => clearTimeout(timer);
  }, []);

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-500 text-white hover:bg-red-600',
      medium: 'bg-yellow-500 text-white hover:bg-yellow-600',
      low: 'bg-green-500 text-white hover:bg-green-600'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      'in-progress': 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      'escalated': 'bg-red-100 text-red-800 hover:bg-red-200',
      'resolved': 'bg-green-100 text-green-800 hover:bg-green-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSentimentColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.issueCategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-medium">Ticket Generation Dashboard</h3>
          {tickets.length > 5 && (
            <Badge className="bg-green-500 text-white animate-pulse">
              New Ticket Generated
            </Badge>
          )}
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Assigned Agent</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Sentiment</TableHead>
              <TableHead>Follow-up</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow key={ticket.ticketId} className="hover:bg-muted/50">
                <TableCell className="font-medium">{ticket.ticketId}</TableCell>
                <TableCell>
                  <Badge variant="outline">{ticket.issueCategory}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityBadge(ticket.priority)}>
                    {ticket.priority.toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadge(ticket.status)}>
                    {ticket.status.replace('-', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{ticket.customerName}</div>
                    <div className="text-xs text-muted-foreground">{ticket.accountNumber}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {ticket.assignedAgent ? (
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span className="text-sm">{ticket.assignedAgent}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-xs">
                  {new Date(ticket.createdTime).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${getSentimentColor(ticket.sentimentScore)}`}>
                    {ticket.sentimentScore}%
                  </span>
                </TableCell>
                <TableCell>
                  {ticket.followupRequired ? (
                    <div className="flex items-center space-x-1 text-orange-600">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs">{ticket.followupDate}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No</span>
                  )}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Ticket Details - {ticket.ticketId}</DialogTitle>
                      </DialogHeader>
                      {selectedTicket && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Customer</label>
                              <p>{selectedTicket.customerName}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Contact</label>
                              <p>{selectedTicket.contactInfo}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Category</label>
                              <p>{selectedTicket.issueCategory}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Priority</label>
                              <Badge className={getPriorityBadge(selectedTicket.priority)}>
                                {selectedTicket.priority.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Issue Description</label>
                            <p className="mt-1 p-3 bg-muted rounded-lg text-sm">
                              {selectedTicket.issueDescription}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm">Assign Agent</Button>
                            <Button variant="outline" size="sm">Update Status</Button>
                            <Button variant="outline" size="sm">Add Notes</Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}