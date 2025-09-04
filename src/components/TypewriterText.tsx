import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // base milliseconds per character
  onComplete?: () => void;
  onStart?: () => void;
  className?: string;
  delay?: number; // delay before starting animation
}

export function TypewriterText({ 
  text, 
  speed = 50, 
  onComplete, 
  onStart,
  className = "",
  delay = 0 
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Function to get natural typing speed with variations
  const getTypingSpeed = (char: string, index: number, fullText: string) => {
    const baseSpeed = speed;
    
    // Longer pause after sentence endings
    if (['.', '!', '?'].includes(char)) {
      return baseSpeed * 3; // Longer pause after sentences
    }
    
    // Medium pause after commas and other punctuation
    if ([',', ';', ':'].includes(char)) {
      return baseSpeed * 2; // Medium pause after commas
    }
    
    // Slight pause after spaces, especially after longer words
    if (char === ' ') {
      const wordBefore = fullText.substring(0, index).split(' ').pop() || '';
      if (wordBefore.length > 7) {
        return baseSpeed * 2; // Longer pause after long words
      }
      return baseSpeed * 1.3; // Normal space pause
    }
    
    // Slightly faster for common letters (muscle memory effect)
    if (['e', 't', 'a', 'o', 'i', 'n', 's', 'h', 'r'].includes(char.toLowerCase())) {
      return baseSpeed * 0.7;
    }
    
    // Slower for numbers and special characters
    if (/[0-9]/.test(char)) {
      return baseSpeed * 1.4;
    }
    
    if (/[^a-zA-Z0-9\s]/.test(char) && !['.', '!', '?', ',', ';', ':'].includes(char)) {
      return baseSpeed * 1.3;
    }
    
    // Add realistic randomness for natural feel (±25%)
    const variation = (Math.random() - 0.5) * 0.5;
    return Math.max(baseSpeed * (1 + variation), baseSpeed * 0.3); // Ensure minimum speed
  };

  useEffect(() => {
    if (currentIndex < text.length) {
      const currentChar = text[currentIndex];
      const typingSpeed = getTypingSpeed(currentChar, currentIndex, text);
      
      const timeoutId = setTimeout(() => {
        // Call onStart when we begin typing (first character)
        if (currentIndex === 0) {
          if (onStart) {
            onStart();
          }
          setIsTyping(true);
        }
        
        setDisplayedText(prev => prev + currentChar);
        setCurrentIndex(prev => prev + 1);
      }, currentIndex === 0 ? delay : typingSpeed);

      return () => clearTimeout(timeoutId);
    } else if (currentIndex === text.length) {
      setIsTyping(false);
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentIndex, text, speed, delay, onComplete, onStart]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsTyping(false);
  }, [text]);

  return (
    <span className={className}>
      {displayedText}
      {/* Enhanced cursor with realistic blinking */}
      {isTyping && (
        <span className="relative inline-block ml-0.5">
          <span className="inline-block w-0.5 h-[1.1em] bg-current animate-typing-cursor rounded-sm" />
        </span>
      )}
    </span>
  );
}