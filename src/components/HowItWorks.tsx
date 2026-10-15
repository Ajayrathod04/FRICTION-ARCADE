import React from 'react';
import { Badge } from './ui/Badge';
import { Icons } from './ui/Icons';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: 1,
      title: 'Explore the Station',
      subtitle: 'Locate 3 hotspots',
      description: 'Navigate the 3D train station or accessible 2D map. Discover the ticket kiosk, departure board, and help desk.',
      color: '#FFD23F',
      icon: <Icons.Search size={28} color="#17131F" />,
    },
    {
      num: 2,
      title: 'Solve the Challenge',
      subtitle: 'Spot interface friction',
      description: 'Attempt to book 2 tickets from Mumbai to Pune. Notice where missing labels, unclear errors, and bad hierarchy slow you down.',
      color: '#FF3B30',
      icon: <Icons.Alert size={28} color="#FFFFFF" />,
    },
    {
      num: 3,
      title: 'Fix the Flow',
      subtitle: 'Switch to Designer Mode',
      description: 'Apply high-UX repairs. Retest the journey to record your personal performance gains and take home 8 practical rules.',
      color: '#B6FFB2',
      icon: <Icons.Wrench size={28} color="#17131F" />,
    },
  ];

  return (
    <section className="how-it-works-section" id="how-it-works" aria-labelledby="how-it-works-title">
      <div className="section-container">
        <div className="section-header">
          <Badge variant="sticker" color="#FFD23F" rotate={1}>
            3-STEP LOOP
          </Badge>
          <h2 id="how-it-works-title" className="section-title">
            How It Works
          </h2>
          <p className="section-subtitle">
            An interactive micro-game designed to teach essential usability principles in under two minutes without boring theory.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((step) => (
            <div key={step.num} className="step-card">
              <div className="step-card__top">
                <span className="step-number" style={{ backgroundColor: step.color }}>
                  {step.num}
                </span>
                <span className="step-icon-box">{step.icon}</span>
              </div>
              <h3 className="step-card__title">{step.title}</h3>
              <span className="step-card__subtitle">{step.subtitle}</span>
              <p className="step-card__desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
