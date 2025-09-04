import { useState, useEffect } from 'react';
import { Bot, User } from 'lucide-react';

interface VoiceAnimationProps {
  isActive: boolean;
  speaker: 'customer' | 'ai';
}

export function VoiceAnimation({ isActive, speaker }: VoiceAnimationProps) {
  const [waveformBars, setWaveformBars] = useState<number[]>([3, 7, 4, 8, 2, 6, 5]);

  useEffect(() => {
    if (!isActive) {
      setWaveformBars([1, 1, 1, 1, 1, 1, 1]);
      return;
    }

    const interval = setInterval(() => {
      // More realistic waveform patterns
      const baseIntensity = speaker === 'ai' ? 3 : 4; // AI tends to be more consistent
      setWaveformBars(prev => prev.map((_, index) => {
        const variation = Math.floor(Math.random() * 8) + baseIntensity;
        // Create more natural wave patterns
        const neighborInfluence = index > 0 ? prev[index - 1] * 0.3 : 0;
        return Math.min(12, Math.max(2, variation + neighborInfluence));
      }));
    }, 120);

    return () => clearInterval(interval);
  }, [isActive, speaker]);

  return (
    <div className={`flex items-center space-x-2 ${
      speaker === 'customer' ? 'flex-row-reverse space-x-reverse' : ''
    }`}>
      {/* Avatar with animation */}
      <div className={`relative ${
        isActive 
          ? 'animate-pulse' 
          : speaker === 'ai' 
            ? 'animate-pulse' 
            : ''
      }`}>
        <div className={`p-2 rounded-full ${
          speaker === 'customer' 
            ? 'bg-[#1B365D] text-white' 
            : 'bg-blue-500 text-white'
        } ${isActive ? 'ring-4 ring-blue-300 ring-opacity-50' : ''}`}>
          {speaker === 'customer' ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>
        
        {/* Ripple effect for active speaker */}
        {isActive && (
          <>
            <div className={`absolute inset-0 rounded-full border-2 ${
              speaker === 'customer' ? 'border-[#1B365D]' : 'border-blue-400'
            } animate-ping opacity-25`}></div>
            <div className={`absolute inset-0 rounded-full border-2 ${
              speaker === 'customer' ? 'border-[#1B365D]' : 'border-blue-400'
            } animate-ping opacity-50`} style={{animationDelay: '0.3s'}}></div>
            <div className={`absolute inset-0 rounded-full border-2 ${
              speaker === 'customer' ? 'border-[#1B365D]' : 'border-blue-400'
            } animate-ping opacity-25`} style={{animationDelay: '0.6s'}}></div>
          </>
        )}
      </div>

      {/* Waveform visualization */}
      {isActive && (
        <div className="flex items-end space-x-0.5 h-10">
          {waveformBars.map((height, index) => (
            <div
              key={index}
              className={`w-1.5 rounded-full transition-all duration-100 ease-out ${
                speaker === 'customer' ? 'bg-[#1B365D]' : 'bg-blue-500'
              } ${height > 8 ? 'opacity-100' : 'opacity-70'}`}
              style={{ 
                height: `${height * 2.5}px`,
                minHeight: '4px',
                transform: `scaleY(${0.8 + (height / 15)})`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}