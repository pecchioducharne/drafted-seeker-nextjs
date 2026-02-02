'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

const QUESTION_TIPS = {
  1: {
    title: "Question 1 Explained",
    subtitle: "What makes you stand out?",
    tips: [
      {
        title: "Be Specific",
        description: "Don't say \"I'm a hard worker\" - give concrete examples of unique skills, experiences, or perspectives that set you apart."
      },
      {
        title: "Show Personality",
        description: "Let your authentic self shine through. Recruiters want to see the real you, not a rehearsed corporate persona."
      },
      {
        title: "Connect to Role",
        description: "Link your unique traits to the types of roles or companies you're targeting. Show how you'd add value."
      },
      {
        title: "Use Examples",
        description: "Back up your claims with real stories, achievements, or experiences that demonstrate your unique qualities."
      },
      {
        title: "Be Concise",
        description: "You have 90 seconds - make every word count. Focus on 2-3 key points rather than trying to cover everything."
      }
    ]
  },
  2: {
    title: "Question 2 Explained",
    subtitle: "Tell us about your journey",
    tips: [
      {
        title: "Start with Context",
        description: "Set the scene - where you started (your major, school, early interests) to help viewers understand your path."
      },
      {
        title: "Show Growth",
        description: "Highlight how you've evolved, what you've learned, and skills you've developed along the way."
      },
      {
        title: "Highlight Pivots",
        description: "Share key decisions, turning points, or \"aha moments\" that shaped your journey and career direction."
      },
      {
        title: "Connect the Dots",
        description: "Explain how your past experiences, courses, projects, or jobs led you to where you are and what you want to do."
      },
      {
        title: "Look Forward",
        description: "End by connecting your journey to your future goals - where you're heading and why you're excited about it."
      }
    ]
  },
  3: {
    title: "Question 3 Explained",
    subtitle: "Challenge or Project",
    options: [
      {
        optionTitle: "Talk about a challenge you've overcome",
        tips: [
          {
            title: "Use STAR Method",
            description: "Structure your answer: Situation (context), Task (your responsibility), Action (what you did), Result (outcome and learning)."
          },
          {
            title: "Show Problem-Solving",
            description: "Focus on your approach and thought process. How did you analyze the challenge? What options did you consider?"
          },
          {
            title: "Emphasize Learning",
            description: "What did you gain from the experience? How did it make you better? What would you do differently next time?"
          },
          {
            title: "Demonstrate Impact",
            description: "Quantify results when possible. Did you save time, improve performance, help teammates, or achieve a specific outcome?"
          },
          {
            title: "Be Honest",
            description: "Real, authentic challenges resonate more than perfect stories. Vulnerability shows self-awareness and growth mindset."
          }
        ]
      },
      {
        optionTitle: "Walk us through something you've built",
        tips: [
          {
            title: "Start with the Why",
            description: "Explain the problem you were solving or the goal you wanted to achieve. What motivated you to build this?"
          },
          {
            title: "Describe Your Process",
            description: "Walk through your approach - planning, design decisions, technologies chosen, and why. Show your thought process."
          },
          {
            title: "Highlight Technical Skills",
            description: "Mention specific tools, frameworks, or methodologies you used. Be technical but accessible."
          },
          {
            title: "Show the Impact",
            description: "What did your project accomplish? Did it solve the problem? How many people used it? What feedback did you get?"
          },
          {
            title: "Reflect and Iterate",
            description: "What did you learn from building this? What would you do differently now? How did it help you grow?"
          }
        ]
      }
    ]
  }
};

export default function QuestionExplainedModal({ isOpen, onClose, questionNumber, selectedOption = 0 }) {
  const [currentOption, setCurrentOption] = useState(selectedOption);
  const questionData = QUESTION_TIPS[questionNumber];
  
  // Update current option when selectedOption prop changes (for question 3)
  useEffect(() => {
    if (questionNumber === 3) {
      setCurrentOption(selectedOption);
    }
  }, [selectedOption, questionNumber]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !questionData) return null;

  // Check if this is question 3 with options
  const hasOptions = questionData.options && questionData.options.length > 0;
  const tipsToShow = hasOptions ? questionData.options[currentOption].tips : questionData.tips;
  const subtitle = hasOptions ? questionData.options[currentOption].optionTitle : questionData.subtitle;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="relative w-full max-w-2xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl shadow-2xl border border-white/10 pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="p-6 pb-4 border-b border-white/10">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
              {questionData.title}
            </h2>
            
            {/* Question Toggle for Question 3 */}
            {hasOptions && (
              <div className="flex gap-2 mb-3">
                {questionData.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentOption(index)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      currentOption === index
                        ? 'bg-drafted-green text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {index === 0 ? 'Challenge' : 'Project'}
                  </button>
                ))}
              </div>
            )}
            
            <p className="text-gray-400 text-sm">
              {subtitle}
            </p>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              {tipsToShow.map((tip, index) => (
                <div key={index} className="group">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-drafted-green/20 to-emerald-500/20 border border-drafted-green/30 flex items-center justify-center">
                      <span className="text-drafted-green text-sm font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1.5 group-hover:text-drafted-green transition-colors">
                        {tip.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 border-t border-white/10 bg-slate-900/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                💡 Use these tips to structure your answer
              </p>
              <button
                onClick={onClose}
                className="drafted-btn drafted-btn-primary px-6 py-2"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
