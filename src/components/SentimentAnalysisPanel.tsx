import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

// Realistic sentiment progression based on conversation flow
const sentimentProgression = [
  { time: '0:00', sentiment: 70, emotions: ['Calm', 'Polite'], currentSentiment: 'neutral', confidence: 85 },
  { time: '0:15', sentiment: 30, emotions: ['Frustrated', 'Urgent'], currentSentiment: 'negative', confidence: 92 },
  { time: '0:45', sentiment: 40, emotions: ['Concerned', 'Hopeful'], currentSentiment: 'neutral', confidence: 78 },
  { time: '1:15', sentiment: 45, emotions: ['Cooperative', 'Patient'], currentSentiment: 'neutral', confidence: 82 },
  { time: '1:45', sentiment: 50, emotions: ['Understanding', 'Attentive'], currentSentiment: 'neutral', confidence: 88 },
  { time: '2:30', sentiment: 25, emotions: ['Angry', 'Impatient'], currentSentiment: 'negative', confidence: 95 },
  { time: '3:15', sentiment: 55, emotions: ['Cautious', 'Skeptical'], currentSentiment: 'neutral', confidence: 86 },
  { time: '4:00', sentiment: 45, emotions: ['Worried', 'Questioning'], currentSentiment: 'neutral', confidence: 83 },
  { time: '4:45', sentiment: 65, emotions: ['Relieved', 'Optimistic'], currentSentiment: 'neutral', confidence: 89 },
  { time: '5:30', sentiment: 75, emotions: ['Satisfied', 'Grateful'], currentSentiment: 'positive', confidence: 91 },
  { time: '6:15', sentiment: 85, emotions: ['Happy', 'Appreciative'], currentSentiment: 'positive', confidence: 94 },
];

export function SentimentAnalysisPanel() {
  const [currentSentiment, setCurrentSentiment] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [confidenceScore, setConfidenceScore] = useState(85);
  const [sentimentHistory, setSentimentHistory] = useState(sentimentProgression.slice(0, 1));
  const [currentProgressionIndex, setCurrentProgressionIndex] = useState(0);
  const [emotions, setEmotions] = useState([
    { name: 'Neutral', active: true, color: 'bg-blue-500' },
    { name: 'Polite', active: true, color: 'bg-green-500' },
    { name: 'Cooperative', active: false, color: 'bg-green-500' },
    { name: 'Urgent', active: false, color: 'bg-yellow-500' },
  ]);

  // Real-time sentiment updates based on conversation progression
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentProgressionIndex < sentimentProgression.length - 1) {
        const nextIndex = currentProgressionIndex + 1;
        const nextPoint = sentimentProgression[nextIndex];
        
        setCurrentProgressionIndex(nextIndex);
        setCurrentSentiment(nextPoint.currentSentiment);
        setConfidenceScore(nextPoint.confidence);
        
        // Update emotions - ensure unique emotions and prevent duplicates
        const emotionSet = new Set();
        const newEmotions = [];
        
        // Add emotions from current point
        nextPoint.emotions.forEach((emotion, index) => {
          if (emotion && !emotionSet.has(emotion)) {
            emotionSet.add(emotion);
            newEmotions.push({
              name: emotion,
              active: true,
              color: getEmotionColor(emotion)
            });
          }
        });
        
        // Add default emotions if we don't have enough unique ones
        const defaultEmotions = ['Attentive', 'Focused', 'Engaged', 'Responsive'];
        defaultEmotions.forEach(emotion => {
          if (newEmotions.length < 4 && !emotionSet.has(emotion)) {
            emotionSet.add(emotion);
            newEmotions.push({
              name: emotion,
              active: nextPoint.currentSentiment === 'positive',
              color: 'bg-blue-500'
            });
          }
        });
        
        setEmotions(newEmotions);
        
        // Update sentiment history
        setSentimentHistory(prev => {
          const newHistory = [...prev, nextPoint];
          return newHistory.slice(-8); // Keep last 8 points
        });
      }
    }, 4000); // Update every 4 seconds to match conversation flow

    return () => clearInterval(interval);
  }, [currentProgressionIndex]);

  const getEmotionColor = (emotion?: string) => {
    switch (emotion) {
      case 'Frustrated':
      case 'Angry': return 'bg-red-500';
      case 'Concerned':
      case 'Cautious':
      case 'Skeptical': return 'bg-orange-500';
      case 'Happy':
      case 'Satisfied':
      case 'Grateful':
      case 'Appreciative': return 'bg-green-500';
      case 'Urgent':
      case 'Impatient': return 'bg-yellow-500';
      case 'Relieved':
      case 'Hopeful': return 'bg-emerald-500';
      default: return 'bg-blue-500';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-5 w-5" />;
      case 'negative': return <TrendingDown className="h-5 w-5" />;
      default: return <Minus className="h-5 w-5" />;
    }
  };

  const getSentimentProgress = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 85;
      case 'negative': return 25;
      default: return 50;
    }
  };

  return (
    <div className="space-y-4">
      {/* Live Sentiment Gauge */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Real-Time Sentiment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`inline-flex items-center space-x-2 text-2xl font-medium ${getSentimentColor(currentSentiment)}`}>
              {getSentimentIcon(currentSentiment)}
              <span className="capitalize">{currentSentiment}</span>
            </div>
            <Progress 
              value={getSentimentProgress(currentSentiment)} 
              className="mt-3"
            />
          </div>
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Confidence</span>
            <span>{confidenceScore}%</span>
          </div>
          <Progress value={confidenceScore} className="h-2" />
        </CardContent>
      </Card>

      {/* Emotion Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detected Emotions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {emotions.map((emotion, index) => (
              <Badge
                key={`${emotion.name}-${index}`}
                variant={emotion.active ? "default" : "outline"}
                className={`justify-center py-2 ${
                  emotion.active 
                    ? `${emotion.color} text-white hover:opacity-90` 
                    : 'text-muted-foreground'
                }`}
              >
                {emotion.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sentiment Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentimentHistory}>
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />
                <YAxis hide />
                <Line 
                  type="monotone" 
                  dataKey="sentiment" 
                  stroke="#1B365D" 
                  strokeWidth={2}
                  dot={{ fill: '#1B365D', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Alert System */}
      {currentSentiment === 'negative' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Negative sentiment detected. Consider escalating to human agent.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}