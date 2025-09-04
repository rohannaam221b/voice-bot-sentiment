import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Send } from 'lucide-react';
import { VoiceAnimation } from './VoiceAnimation';
import { CustomerInfoPanel } from './CustomerInfoPanel';
import { TypewriterText } from './TypewriterText';

interface Message {
  id: string;
  speaker: 'customer' | 'ai';
  message: string;
  timestamp: Date;
  sentiment?: 'positive' | 'neutral' | 'negative';
  isNew?: boolean;
  showWaveformFirst?: boolean;
  messageVisible?: boolean;
  isAnimating?: boolean;
}

// Realistic conversation flow
const conversationFlow = [
  {
    speaker: 'ai' as const,
    message: 'Hello! Welcome to SecureBank. I\'m your AI assistant. How can I help you today?',
    delay: 1000,
  },
  {
    speaker: 'customer' as const,
    message: 'Hi, I\'m having trouble with my UPI transaction. It failed but the money was deducted from my account.',
    sentiment: 'negative' as const,
    delay: 3000,
  },
  {
    speaker: 'ai' as const,
    message: 'I understand your concern about the failed UPI transaction. Let me quickly check your account details and recent transactions to help resolve this issue.',
    delay: 4000,
  },
  {
    speaker: 'customer' as const,
    message: 'It happened this morning around 10:30 AM. The transaction was for ₹2,500 to a merchant called PayTM_Grocery.',
    sentiment: 'neutral' as const,
    delay: 3500,
  },
  {
    speaker: 'ai' as const,
    message: 'I can see the transaction in your account history. Let me check with our payment gateway partner for the status of transaction ID UPI2024011514301234.',
    delay: 5000,
  },
  {
    speaker: 'customer' as const,
    message: 'This is really frustrating. I need that money back urgently. I have other payments to make today.',
    sentiment: 'negative' as const,
    delay: 3000,
  },
  {
    speaker: 'ai' as const,
    message: 'I completely understand your frustration. Based on my investigation, the transaction was processed but failed at the merchant end. I\'m initiating an immediate refund which should reflect in your account within 2-4 hours.',
    delay: 6000,
  },
  {
    speaker: 'customer' as const,
    message: 'How can I be sure this will be resolved? I\'ve had issues before and it took weeks to get my money back.',
    sentiment: 'negative' as const,
    delay: 4000,
  },
  {
    speaker: 'ai' as const,
    message: 'I\'ve created a high-priority ticket TKT-2024-0016 for your case. You\'ll receive SMS and email confirmations. I\'m also escalating this to our specialized refund team to ensure faster processing.',
    delay: 5500,
  },
  {
    speaker: 'customer' as const,
    message: 'Okay, that sounds better. Will I get any confirmation or reference number?',
    sentiment: 'neutral' as const,
    delay: 3000,
  },
  {
    speaker: 'ai' as const,
    message: 'Yes, your reference number is REF-UPI-2024-001234. I\'ve also sent you an SMS with all the details. Is there anything else I can help you with today?',
    delay: 4000,
  },
  {
    speaker: 'customer' as const,
    message: 'Thank you for your help. I appreciate the quick response and the escalation.',
    sentiment: 'positive' as const,
    delay: 2500,
  },
  {
    speaker: 'ai' as const,
    message: 'You\'re very welcome! I\'m glad I could assist you today. Your refund should be processed soon, and you can always call us back if you need any updates.',
    delay: 4000,
  }
];

export function VoiceChatWindow() {
  const [callStatus, setCallStatus] = useState<'Connected' | 'Speaking' | 'Listening' | 'Processing'>('Connected');
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<'customer' | 'ai' | null>(null);
  const [inputMessage, setInputMessage] = useState('');

  // Function to add waveform-first message
  const addWaveformMessage = useCallback((speaker: 'customer' | 'ai') => {
    const messageId = `message-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: messageId,
      speaker,
      message: '',
      timestamp: new Date(),
      isNew: true,
      showWaveformFirst: true,
      messageVisible: false
    }]);
    return messageId;
  }, []);

  // Function to update message with actual content
  const updateMessage = useCallback((id: string, message: string, sentiment?: 'positive' | 'neutral' | 'negative') => {
    setMessages(prev => prev.map(msg => 
      msg.id === id 
        ? { ...msg, message, sentiment, isNew: false, showWaveformFirst: false }
        : msg
    ));
  }, []);

  // Function to show message content after waveform
  const showMessageContent = useCallback((id: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id 
        ? { ...msg, messageVisible: true, isAnimating: false } // Start as false, will be set to true when typing starts
        : msg
    ));
  }, []);

  // Function to start message animation
  const startMessageAnimation = useCallback((id: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id 
        ? { ...msg, isAnimating: true }
        : msg
    ));
  }, []);

  // Function to mark message animation as complete
  const completeMessageAnimation = useCallback((id: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id 
        ? { ...msg, isAnimating: false }
        : msg
    ));
  }, []);

  // Real-time conversation simulation
  useEffect(() => {
    if (currentMessageIndex >= conversationFlow.length) return;

    const currentMsg = conversationFlow[currentMessageIndex];
    let timeoutId: NodeJS.Timeout;

    const processMessage = () => {
      // Set listening state when waiting for customer
      if (currentMsg.speaker === 'customer') {
        setCallStatus('Listening');
        setCurrentSpeaker('customer');
      } else {
        setCallStatus('Processing');
        setCurrentSpeaker(null);
      }

      // Add waveform-first message
      const messageId = addWaveformMessage(currentMsg.speaker);
      setIsTyping(true);

      // Show waveform first
      const waveformDuration = currentMsg.speaker === 'ai' ? 1500 : 1200;
      
      setTimeout(() => {
        setCallStatus('Speaking');
        setCurrentSpeaker(currentMsg.speaker);
        setIsTyping(false);
        
        // Update with actual message but don't show content yet
        updateMessage(messageId, currentMsg.message, currentMsg.sentiment);
        
        // Show message content after brief delay
        setTimeout(() => {
          showMessageContent(messageId);
          
          // Calculate typing duration based on message length with realistic timing
          const baseSpeed = currentMsg.speaker === 'ai' ? 40 : 60;
          const avgTypingDuration = currentMsg.message.length * baseSpeed * 1.2; // Account for natural variations and pauses
          const typingDuration = avgTypingDuration + 300; // Add delay
          
          // Set status back to connected after typing animation completes
          setTimeout(() => {
            setCallStatus('Connected');
            setCurrentSpeaker(null);
            setCurrentMessageIndex(prev => prev + 1);
          }, typingDuration + 500); // Add 500ms buffer after typing completes
        }, 600);
      }, waveformDuration);
    };

    timeoutId = setTimeout(processMessage, currentMsg.delay);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentMessageIndex, addWaveformMessage, updateMessage, showMessageContent]);



  // Handle manual message sending
  const handleSendMessage = useCallback(() => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: `manual-${Date.now()}`,
        speaker: 'customer',
        message: inputMessage.trim(),
        timestamp: new Date(),
        sentiment: 'neutral',
        messageVisible: true,
        isAnimating: false // Will be set to true when TypewriterText starts
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');
    }
  }, [inputMessage]);

  // Handle Enter key press in input
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);



  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Connected': return 'bg-green-500';
      case 'Speaking': return 'bg-blue-500';
      case 'Listening': return 'bg-yellow-500';
      case 'Processing': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Customer Info Panel */}
      <CustomerInfoPanel />
      
      {/* Main Chat Window */}
      <Card className="h-[1040px] flex flex-col">
        <CardHeader className="border-b bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CardTitle className="text-lg">Live Voice Conversation</CardTitle>
              <Badge className={`${getStatusBadgeColor(callStatus)} text-white`}>
                {callStatus}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="sm"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm">
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm">
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Messages Area */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((message, index) => {
            // Determine if waveform should be active - ONLY during text animation phases
            const isWaveformActive = 
              // Show waveform when message is in "waveform first" phase (before text appears)
              message.showWaveformFirst ||
              // Show waveform when message is actively animating with typewriter effect
              message.isAnimating;
            
            return (
              <div
                key={message.id}
                className={`flex ${message.speaker === 'customer' ? 'justify-end' : 'justify-start'} ${
                  message.isNew ? 'animate-fade-in' : ''
                }`}
              >
                <div className={`flex items-end space-x-2 max-w-[80%] ${
                  message.speaker === 'customer' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <VoiceAnimation 
                    isActive={isWaveformActive}
                    speaker={message.speaker}
                  />
                  
                  {/* Show message bubble only when content should be visible */}
                  {((message.message !== '' && message.messageVisible !== false) || message.message === '') && (
                    <div className={`p-3 rounded-lg transition-all duration-500 ${
                      message.speaker === 'customer' 
                        ? 'bg-[#1B365D] text-white' 
                        : 'bg-gray-100 text-gray-900'
                    } ${message.isNew ? 'scale-95 opacity-80' : 'scale-100 opacity-100'} ${
                      message.messageVisible === false ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                    }`}>
                      {message.message === '' ? (
                        // Typing indicator (only when message is truly empty)
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm">
                            {message.messageVisible && !message.isAnimating ? (
                              // Show completed message
                              message.message
                            ) : message.messageVisible ? (
                              // Show typewriter animation
                              <TypewriterText 
                                text={message.message}
                                speed={message.speaker === 'ai' ? 40 : 60} // AI types faster than customer
                                delay={300}
                                onStart={() => startMessageAnimation(message.id)}
                                onComplete={() => completeMessageAnimation(message.id)}
                              />
                            ) : null}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs ${
                              message.speaker === 'customer' ? 'text-blue-200' : 'text-gray-500'
                            }`}>
                              {formatTime(message.timestamp)}
                            </span>
                            {message.sentiment && (
                              <Badge 
                                variant="outline" 
                                className={`ml-2 text-xs ${
                                  message.sentiment === 'positive' ? 'border-green-500 text-green-700' :
                                  message.sentiment === 'negative' ? 'border-red-500 text-red-700' :
                                  'border-yellow-500 text-yellow-700'
                                }`}
                              >
                                {message.sentiment}
                              </Badge>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>

        {/* Chat Input Area */}
        <div className="border-t bg-white p-4 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1"
              disabled={callStatus === 'Processing'}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || callStatus === 'Processing'}
              size="sm"
              className="bg-[#1B365D] hover:bg-[#152a4a]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}