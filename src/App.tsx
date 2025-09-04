import { useState, useEffect } from 'react';
import { VoiceChatWindow } from './components/VoiceChatWindow';
import { SentimentAnalysisPanel } from './components/SentimentAnalysisPanel';
import { SentimentAnalysisTable } from './components/SentimentAnalysisTable';
import { TicketGenerationDashboard } from './components/TicketGenerationDashboard';
import { DashboardHeader } from './components/DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card } from './components/ui/card';

export default function App() {
  const [activeCallsCount, setActiveCallsCount] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <DashboardHeader 
        activeCallsCount={activeCallsCount}
        currentTime={currentTime}
      />
      
      <div className="p-6 max-w-[1920px] mx-auto">
        {/* Main Dashboard Row - 60% Live Chat, 40% Sentiment Analysis */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* Live Voice Conversation - 60% width */}
          <div className="w-full h-full lg:w-[60%]">
            <VoiceChatWindow />
          </div>
          
          {/* Real-Time Sentiment and Detected Emotions with Timeline - 40% width */}
          <div className="w-full lg:w-[40%] space-y-6">
            <SentimentAnalysisPanel />
            
            {/* Sentiment Timeline */}
            <Card className="p-4">
              <h3 className="mb-4">Sentiment Timeline</h3>
              <SentimentAnalysisTable />
            </Card>
          </div>
        </div>

        {/* Bottom Section - Ticket Management */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-6">Ticket Management</h2>
            <TicketGenerationDashboard />
          </Card>
        </div>
      </div>
    </div>
  );
}