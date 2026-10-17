import React, { useState } from 'react';
import { Icons } from '../../components/ui/Icons';
import { SoundEffects } from '../../lib/audio';

interface FrictionFlaw {
  id: string;
  num: string;
  title: string;
  flawSummary: string;
  quote: string;
  accentColor: string;
  badgeBg: string;
  icon: React.ReactNode;
  illustrationType: 'placeholder' | 'feedback' | 'actions';
  fixHeading: string;
  fixDescription: string;
  guidelineRule: string;
}

const FLAWS: FrictionFlaw[] = [
  {
    id: 'flaw-1',
    num: '01',
    title: 'Missing Context',
    flawSummary: 'Placeholder text vanishes the instant a traveler begins typing, stripping away field purpose and format examples.',
    quote: '“Wait... was this field for Departure City or Passenger Name?”',
    accentColor: '#FF8A1F',
    badgeBg: '#FFF3D6',
    icon: <Icons.Tag size={28} color="#FF8A1F" />,
    illustrationType: 'placeholder',
    fixHeading: 'Persistent Floating Labels',
    fixDescription: 'Labels must remain continuously visible above the field. Complement with persistent helper text so users can verify entries without clearing the input.',
    guidelineRule: 'Rule #1: Never use placeholder text as a replacement for field labels.',
  },
  {
    id: 'flaw-2',
    num: '02',
    title: 'Confusing Feedback',
    flawSummary: 'A field turning red without text fails color-blind commuters and leaves everyone guessing what went wrong.',
    quote: '“The screen turned red, but which line has the error?”',
    accentColor: '#FF3D8B',
    badgeBg: '#FFE4EE',
    icon: <Icons.Alert size={28} color="#FF3D8B" />,
    illustrationType: 'feedback',
    fixHeading: 'Actionable Inline Feedback',
    fixDescription: 'Combine color with high-contrast icons and specific instructions explaining exactly what is wrong and how to fix it.',
    guidelineRule: 'Rule #2: Deliver inline messages with text, icons, and precise correction steps.',
  },
  {
    id: 'flaw-3',
    num: '03',
    title: 'Unclear Actions',
    flawSummary: 'When primary confirmation, secondary filters, and destructive cancel buttons share identical visual weights, travelers hesitate.',
    quote: '“I just wanted to buy my ticket, but I clicked Cancel by mistake.”',
    accentColor: '#C7B5FF',
    badgeBg: '#EFE8FF',
    icon: <Icons.Target size={28} color="#7C3AED" />,
    illustrationType: 'actions',
    fixHeading: 'Distinct Button Hierarchy',
    fixDescription: 'Use a single high-contrast primary CTA for advancing the mission. De-emphasize secondary options with outline styling and separate destructive actions.',
    guidelineRule: 'Rule #3: Establish an unmistakable visual hierarchy for primary vs. secondary actions.',
  },
];

export const FrictionTriadInteractive: React.FC = () => {
  const [activeFlawId, setActiveFlawId] = useState<string | null>(null);

  const toggleFlaw = (id: string) => {
    try {
      SoundEffects.playBlip();
    } catch {
      // audio fallback
    }
    setActiveFlawId(prev => (prev === id ? null : id));
  };

  return (
    <div className="friction-triad-interactive">
      <div className="friction-triad-grid">
        {FLAWS.map(flaw => {
          const isRevealed = activeFlawId === flaw.id;

          return (
            <div
              key={flaw.id}
              className={`friction-poster-card ${isRevealed ? 'is-revealed' : ''}`}
              style={{
                borderColor: isRevealed ? flaw.accentColor : 'var(--color-ink)',
              }}
            >
              {/* Top Meta Bar */}
              <div className="poster-card-top">
                <span className="poster-card-num" style={{ color: flaw.accentColor }}>
                  {flaw.num}
                </span>
                <span className="poster-card-sticker" style={{ backgroundColor: flaw.badgeBg, color: '#17131F' }}>
                  {isRevealed ? '✓ REPAIR REVEALED' : 'TAP TO REPAIR'}
                </span>
              </div>

              {/* Icon & Title */}
              <div className="poster-card-icon-frame" style={{ backgroundColor: flaw.badgeBg }}>
                {flaw.icon}
              </div>

              <h3 className="poster-card-title">{flaw.title}</h3>
              <p className="poster-card-summary">{flaw.flawSummary}</p>

              {/* Graphic Micro-Illustration */}
              <div className="poster-micro-art" aria-hidden="true">
                {flaw.illustrationType === 'placeholder' && (
                  <div className="micro-field-demo">
                    <div className="micro-input-box">
                      <span className="micro-ghost-text">Mumbai CST (Vanishing...)</span>
                      <span className="micro-cursor" />
                    </div>
                  </div>
                )}

                {flaw.illustrationType === 'feedback' && (
                  <div className="micro-field-demo">
                    <div className="micro-error-box">
                      <span className="micro-raw-dot" />
                      <span className="micro-raw-text">Invalid Date Format</span>
                    </div>
                  </div>
                )}

                {flaw.illustrationType === 'actions' && (
                  <div className="micro-field-demo">
                    <div className="micro-buttons-row">
                      <span className="micro-fake-btn gray">Cancel</span>
                      <span className="micro-fake-btn gray">Confirm</span>
                      <span className="micro-fake-btn gray">Details</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Passenger Frustration Quote */}
              <div className="poster-card-quote">
                {flaw.quote}
              </div>

              {/* Interactive Reveal Button */}
              <button
                type="button"
                className="poster-reveal-toggle-btn"
                onClick={() => toggleFlaw(flaw.id)}
                aria-expanded={isRevealed}
                aria-controls={`fix-details-${flaw.id}`}
              >
                <span>{isRevealed ? 'Hide Design Repair ↑' : 'Reveal UX Repair →'}</span>
              </button>

              {/* Revealed Solution Tray */}
              {isRevealed && (
                <div
                  id={`fix-details-${flaw.id}`}
                  className="poster-revealed-tray"
                  role="region"
                  aria-label={`${flaw.title} UX Fix`}
                >
                  <div className="tray-badge" style={{ backgroundColor: flaw.accentColor }}>
                    ★ HUMAN-CENTERED FIX
                  </div>
                  <h4 className="tray-heading">{flaw.fixHeading}</h4>
                  <p className="tray-description">{flaw.fixDescription}</p>
                  <div className="tray-rule">{flaw.guidelineRule}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
