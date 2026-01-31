'use client';

import React, { useState, useEffect } from 'react';

const GREETINGS = [
  // Morning (5am - 11:59am)
  { time: 'morning', messages: [
    'Good morning, {name}. Let\'s make today count.',
    'Morning, {name}. Time to make some moves.',
    'Rise and grind, {name}. The world\'s waiting.',
    'Good morning, {name}. Ready to crush it?'
  ]},
  // Afternoon (12pm - 5:59pm)
  { time: 'afternoon', messages: [
    'Good afternoon, {name}. Keep the momentum going.',
    'Afternoon, {name}. You\'re doing great.',
    'Hey {name}, hope you\'re having a solid day.',
    'What\'s up, {name}? Let\'s keep pushing.'
  ]},
  // Evening (6pm - 8:59pm)
  { time: 'evening', messages: [
    'Good evening, {name}. Time to wrap things up.',
    'Evening, {name}. Almost there.',
    'Hey {name}, nice work today.',
    'Good evening, {name}. You earned this.'
  ]},
  // Night (9pm - 4:59am)
  { time: 'night', messages: [
    'Burning the midnight oil, {name}?',
    'Late night hustle, {name}. Respect.',
    'Hey {name}, don\'t stay up too late.',
    'Night owl mode, {name}? We see you.',
    'Still grinding, {name}? Take a break soon.'
  ]},
  // Special: Weekend
  { time: 'weekend', messages: [
    'Happy weekend, {name}!',
    'Weekend vibes, {name}. Nice.',
    'Hey {name}, enjoy your weekend!',
    'Weekend mode activated, {name}.'
  ]}
];

const getGreeting = (firstName) => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  let timeOfDay;
  
  // Check if weekend
  if (day === 0 || day === 6) {
    const weekendGreetings = GREETINGS.find(g => g.time === 'weekend');
    const randomMessage = weekendGreetings.messages[Math.floor(Math.random() * weekendGreetings.messages.length)];
    return randomMessage.replace('{name}', firstName);
  }
  
  // Determine time of day
  if (hour >= 5 && hour < 12) {
    timeOfDay = 'morning';
  } else if (hour >= 12 && hour < 18) {
    timeOfDay = 'afternoon';
  } else if (hour >= 18 && hour < 21) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }
  
  const greetingGroup = GREETINGS.find(g => g.time === timeOfDay);
  const randomMessage = greetingGroup.messages[Math.floor(Math.random() * greetingGroup.messages.length)];
  
  return randomMessage.replace('{name}', firstName);
};

export default function TypingGreeting({ firstName = 'there' }) {
  const [displayText, setDisplayText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const fullText = getGreeting(firstName);
  
  useEffect(() => {
    let currentIndex = 0;
    setDisplayText('');
    setIsTypingComplete(false);
    
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.substring(0, currentIndex));
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(typingInterval);
      }
    }, 40); // Fast but smooth typing speed
    
    return () => clearInterval(typingInterval);
  }, [fullText]);
  
  return (
    <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-6">
      {displayText}
      {!isTypingComplete && (
        <span className="inline-block w-0.5 h-6 sm:h-7 bg-drafted-green ml-1 animate-pulse" />
      )}
    </h2>
  );
}
