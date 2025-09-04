import { Building2, Phone, Clock, User } from 'lucide-react';
import { Badge } from './ui/badge';

interface DashboardHeaderProps {
  activeCallsCount: number;
  currentTime: Date;
}

export function DashboardHeader({ activeCallsCount, currentTime }: DashboardHeaderProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-[#1B365D] text-white border-b border-border shadow-lg">
      <div className="px-6 py-4 max-w-[1920px] mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-xl font-medium">SecureBank AI</h1>
                <p className="text-blue-200 text-sm">Voice Bot Dashboard</p>
              </div>
            </div>
          </div>

          {/* Center Stats */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-blue-200" />
              <span className="text-sm">Active Calls:</span>
              <Badge variant="secondary" className="bg-green-500 text-white hover:bg-green-600">
                {activeCallsCount}
              </Badge>
            </div>
            
            <div className="h-6 w-px bg-white/20" />
            
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-200" />
              <div className="text-sm">
                <div className="font-medium">{formatTime(currentTime)}</div>
                <div className="text-blue-200 text-xs">{formatDate(currentTime)}</div>
              </div>
            </div>
          </div>

          {/* Agent Info */}
          <div className="flex items-center space-x-3">
            <div className="text-right text-sm hidden sm:block">
              <div className="font-medium">Agent Sarah M.</div>
              <div className="text-blue-200">Supervisor</div>
            </div>
            <div className="p-2 bg-white/10 rounded-full">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}