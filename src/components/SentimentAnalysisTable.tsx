import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Search, Download, Filter } from 'lucide-react';

interface SentimentCall {
  callId: string;
  duration: string;
  overallSentiment: 'positive' | 'neutral' | 'negative';
  keyEmotions: string[];
  escalationTriggered: boolean;
  escalationReason?: string;
  resolutionStatus: 'resolved' | 'transferred' | 'follow-up';
  customerSatisfaction?: number;
  language: string;
  timestamp: string;
}

export function SentimentAnalysisTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');

  const calls: SentimentCall[] = [
    {
      callId: 'CALL-2024-001',
      duration: '05:23',
      overallSentiment: 'negative',
      keyEmotions: ['Frustrated', 'Urgent'],
      escalationTriggered: true,
      escalationReason: 'High frustration level',
      resolutionStatus: 'transferred',
      language: 'English',
      timestamp: '2024-01-15 14:30:22'
    },
    {
      callId: 'CALL-2024-002',
      duration: '03:45',
      overallSentiment: 'positive',
      keyEmotions: ['Satisfied', 'Grateful'],
      escalationTriggered: false,
      resolutionStatus: 'resolved',
      customerSatisfaction: 4.8,
      language: 'Hindi',
      timestamp: '2024-01-15 14:25:15'
    },
    {
      callId: 'CALL-2024-003',
      duration: '07:12',
      overallSentiment: 'neutral',
      keyEmotions: ['Calm', 'Inquisitive'],
      escalationTriggered: false,
      resolutionStatus: 'resolved',
      customerSatisfaction: 4.2,
      language: 'English',
      timestamp: '2024-01-15 14:20:08'
    },
    {
      callId: 'CALL-2024-004',
      duration: '02:18',
      overallSentiment: 'positive',
      keyEmotions: ['Happy', 'Quick'],
      escalationTriggered: false,
      resolutionStatus: 'resolved',
      customerSatisfaction: 5.0,
      language: 'Tamil',
      timestamp: '2024-01-15 14:15:33'
    },
    {
      callId: 'CALL-2024-005',
      duration: '09:45',
      overallSentiment: 'negative',
      keyEmotions: ['Angry', 'Confused', 'Impatient'],
      escalationTriggered: true,
      escalationReason: 'Complex issue + anger',
      resolutionStatus: 'follow-up',
      language: 'English',
      timestamp: '2024-01-15 14:10:12'
    }
  ];

  const getSentimentBadge = (sentiment: string) => {
    const colors = {
      positive: 'bg-green-500 text-white hover:bg-green-600',
      neutral: 'bg-yellow-500 text-white hover:bg-yellow-600',
      negative: 'bg-red-500 text-white hover:bg-red-600'
    };
    return colors[sentiment as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      resolved: 'bg-green-100 text-green-800 hover:bg-green-200',
      transferred: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      'follow-up': 'bg-orange-100 text-orange-800 hover:bg-orange-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredCalls = calls.filter(call => {
    const matchesSearch = call.callId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.keyEmotions.some(emotion => emotion.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = sentimentFilter === 'all' || call.overallSentiment === sentimentFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Post-Call Sentiment Analysis</h3>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search calls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by sentiment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiments</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Call ID</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Sentiment</TableHead>
              <TableHead>Key Emotions</TableHead>
              <TableHead>Escalated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCalls.map((call) => (
              <TableRow key={call.callId} className="hover:bg-muted/50">
                <TableCell className="font-medium">{call.callId}</TableCell>
                <TableCell className="font-mono">{call.duration}</TableCell>
                <TableCell>
                  <Badge className={getSentimentBadge(call.overallSentiment)}>
                    {call.overallSentiment}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {call.keyEmotions.map((emotion) => (
                      <Badge key={emotion} variant="outline" className="text-xs">
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Badge variant={call.escalationTriggered ? "destructive" : "secondary"}>
                      {call.escalationTriggered ? 'Yes' : 'No'}
                    </Badge>
                    {call.escalationReason && (
                      <span className="text-xs text-muted-foreground">
                        ({call.escalationReason})
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadge(call.resolutionStatus)}>
                    {call.resolutionStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  {call.customerSatisfaction ? (
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">{call.customerSatisfaction}</span>
                      <span className="text-xs text-muted-foreground">/5.0</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell>{call.language}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {call.timestamp}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}