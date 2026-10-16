import React, { useState } from 'react';
import { StationHeroIllustration } from './StationHeroIllustration';
import { DesignLabSection } from '../repair-lab/DesignLabSection';
import { DesignRulesSection } from '../../components/DesignRulesSection';
import { Badge } from '../../components/ui/Badge';
import { Icons } from '../../components/ui/Icons';
import { Button } from '../../components/ui/Button';

interface LandingPageProps {
  onStartMission: () => void;
  onPlayWithout3D: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartMission,
  onPlayWithout3D,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-website-root">
      {/* ---------------- A. EDITORIAL HEADER ---------------- */}
      <header className="site-header" role="banner">
        <div className="header-container">
          <a href="#hero" className="header-brand" aria-label="Friction Arcade Home">
            <div className="brand-logo-pill">
              <Icons.Train size={20} color="#FFD23F" />
            </div>
            <span className="brand-name">
              FRICTION<span className="brand-accent">ARCADE</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="header-nav" aria-label="Main Navigation">
            <button type="button" className="nav-link-btn" onClick={() => scrollToSection('story')}>
              Why Friction
            </button>
            <button type="button" className="nav-link-btn" onClick={() => scrollToSection('the-experience')}>
              The Experience
            </button>
            <button type="button" className="nav-link-btn" onClick={() => scrollToSection('principles')}>
              Design Principles
            </button>
            <button type="button" className="nav-link-btn" onClick={() => scrollToSection('design-lab')}>
              Interactive Lab
            </button>
            <button type="button" className="nav-link-btn" onClick={() => scrollToSection('about')}>
              About
            </button>
          </nav>

          <div className="header-actions">
            <Button
              variant="primary"
              size="sm"
              onClick={onStartMission}
              id="header-play-btn"
            >
              PLAY THE MISSION →
            </Button>
            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <Icons.Close size={22} /> : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="mobile-dropdown-nav">
            <button type="button" className="mobile-nav-item" onClick={() => scrollToSection('story')}>
              Why Friction
            </button>
            <button type="button" className="mobile-nav-item" onClick={() => scrollToSection('the-experience')}>
              The Experience
            </button>
            <button type="button" className="mobile-nav-item" onClick={() => scrollToSection('principles')}>
              Design Principles
            </button>
            <button type="button" className="mobile-nav-item" onClick={() => scrollToSection('design-lab')}>
              Interactive Lab
            </button>
            <button type="button" className="mobile-nav-item" onClick={() => scrollToSection('about')}>
              About
            </button>
            <button
              type="button"
              className="mobile-nav-cta"
              onClick={() => {
                setMobileMenuOpen(false);
                onStartMission();
              }}
            >
              PLAY THE MISSION →
            </button>
          </div>
        )}
      </header>

      <main id="main-content">
        {/* ---------------- B. EDITORIAL POSTER HERO ---------------- */}
        <section className="hero-section" id="hero" aria-label="Hero Section">
          <div className="hero-grid">
            {/* Left Column: Typography, Story Hook & Mission CTAs */}
            <div className="hero-content">
              <div className="hero-pill-row">
                <span className="hero-pill">
                  AN INTERACTIVE UX GAME · 2 MINUTES · NO SIGN-UP
                </span>
                <Badge variant="sticker" color="#FF8A1F" rotate={-2}>
                  HYPERBLOOM OCTOBER
                </Badge>
              </div>

              <h1 className="hero-brand-title">
                <span className="hero-wordmark-gradient">FRICTION</span><br />
                <span className="hero-wordmark-gradient">ARCADE</span>
              </h1>

              <div className="hero-headline-group">
                <h2 className="hero-headline">
                  <span className="hero-headline-tag">
                    SPOT THE FRICTION.
                    <span className="hero-headline-squiggle" aria-hidden="true" />
                  </span><br />
                  <span className="hero-headline-flow">FIX THE FLOW.</span>
                </h2>
              </div>

              <p className="hero-lead-text">
                Explore a colourful railway station. Discover three confusing design choices, solve a ticket-booking challenge, and transform the experience with better UX.
              </p>

              <div className="hero-cta-group">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onStartMission}
                  id="hero-start-mission-main-btn"
                  className="hero-start-cta-btn"
                >
                  START THE MISSION →
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={onPlayWithout3D}
                  className="hero-2d-mode-btn"
                >
                  PLAY WITHOUT 3D
                </Button>
              </div>

              <div className="hero-trust-bar">
                <span className="trust-icon">✨</span>
                <span>A fictional booking challenge. Real interactions. Practical design lessons.</span>
                <button
                  type="button"
                  className="how-it-works-link"
                  onClick={() => scrollToSection('story')}
                >
                  HOW IT WORKS ↓
                </button>
              </div>
            </div>

            {/* Right Column: High-Impact Editorial Station Illustration (NON-INTERACTIVE) */}
            <div className="hero-station-col">
              <StationHeroIllustration
                onStartMission={onStartMission}
                onPlayWithout3D={onPlayWithout3D}
              />
            </div>
          </div>
        </section>

        {/* ---------------- C. STORY SECTION: WHY FRICTION MATTERS ---------------- */}
        <section className="editorial-story-section" id="story" aria-label="Why Friction Matters">
          <div className="editorial-container">
            <div className="section-eyebrow-center">
              <span className="eyebrow-badge">THE PROBLEM</span>
              <h2 className="editorial-title">Small design problems. Real frustration.</h2>
              <p className="editorial-subtitle">
                Bad UX doesn't always announce itself with broken pages. It sneaks in as vanishing field context, cryptic error messages, and confusing buttons that make users second-guess themselves.
              </p>
            </div>

            <div className="friction-triad-grid">
              {/* Feature Block 1 */}
              <div className="friction-card">
                <div className="friction-card-num">01</div>
                <div className="friction-icon-wrap" style={{ backgroundColor: '#FFF3D6' }}>
                  <Icons.Tag size={28} color="#FF8A1F" />
                </div>
                <h3 className="friction-card-title">Missing Context</h3>
                <p className="friction-card-desc">
                  Input fields that rely only on floating or placeholder text leave users stranded. The moment you start typing, the clue disappears, making review stressful and error-prone.
                </p>
                <div className="friction-card-quote">
                  “Wait... was this field for Departure City or Passenger Name?”
                </div>
              </div>

              {/* Feature Block 2 */}
              <div className="friction-card">
                <div className="friction-card-num">02</div>
                <div className="friction-icon-wrap" style={{ backgroundColor: '#FFE4EE' }}>
                  <Icons.Alert size={28} color="#FF3D8B" />
                </div>
                <h3 className="friction-card-title">Confusing Feedback</h3>
                <p className="friction-card-desc">
                  A field turning red without text fails color-blind users and leaves everyone guessing. Vague status flags tell you something broke without explaining what went wrong or how to fix it.
                </p>
                <div className="friction-card-quote">
                  “The screen turned red, but which line has the error?”
                </div>
              </div>

              {/* Feature Block 3 */}
              <div className="friction-card">
                <div className="friction-card-num">03</div>
                <div className="friction-icon-wrap" style={{ backgroundColor: '#EFE8FF' }}>
                  <Icons.Target size={28} color="#C7B5FF" />
                </div>
                <h3 className="friction-card-title">Unclear Actions</h3>
                <p className="friction-card-desc">
                  When primary, secondary, and destructive actions share identical weights and sizes, users hesitate. Interfaces must guide the traveler forward with a clear visual hierarchy.
                </p>
                <div className="friction-card-quote">
                  “I just wanted to buy my ticket, but I clicked Cancel by mistake.”
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- D. SECTION: THE EXPERIENCE ---------------- */}
        <section className="experience-narrative-section" id="the-experience" aria-label="The Experience">
          <div className="editorial-container">
            <div className="section-eyebrow-center">
              <span className="eyebrow-badge">THE USER JOURNEY</span>
              <h2 className="editorial-title">From confused traveler to confident designer.</h2>
              <p className="editorial-subtitle">
                Friction Arcade doesn't just explain UX heuristics—it puts you in the shoes of someone trying to board the last train home.
              </p>
            </div>

            <div className="experience-timeline">
              <div className="timeline-item">
                <div className="timeline-marker">1</div>
                <div className="timeline-content">
                  <h3 className="timeline-title">Explore the 3D Station</h3>
                  <p className="timeline-desc">
                    Walk through a vibrant, miniature train concourse. Talk to commuter NPCs, inspect departure boards, and navigate the platform at your own pace.
                  </p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker">2</div>
                <div className="timeline-content">
                  <h3 className="timeline-title">Discover the Friction</h3>
                  <p className="timeline-desc">
                    Investigate three physical landmarks—the Ticket Kiosk, Departure Board, and Help Desk. Uncover forensic clues and collect souvenir ticket stamps.
                  </p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker">3</div>
                <div className="timeline-content">
                  <h3 className="timeline-title">Repair the Design</h3>
                  <p className="timeline-desc">
                    Switch to Designer Mode. Solve three answer-first usability puzzles to replace flawed patterns with human-centered, accessible components.
                  </p>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-marker">4</div>
                <div className="timeline-content">
                  <h3 className="timeline-title">See the Impact</h3>
                  <p className="timeline-desc">
                    Watch the station concourse itself transform into Clarity Mode! Replay the booking with persistent labels, clear inline errors, and prominent CTAs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- E. SECTION: DESIGN PRINCIPLES ---------------- */}
        <section id="principles" aria-label="Design Principles">
          <DesignRulesSection />
        </section>

        {/* ---------------- INTERACTIVE DESIGN LAB SANDBOX ---------------- */}
        <section id="design-lab" aria-label="Interactive Design Lab">
          <DesignLabSection />
        </section>

        {/* ---------------- F. FINAL CALL TO ACTION ---------------- */}
        <section className="final-cta-section" id="cta" aria-label="Call to Action">
          <div className="final-cta-card">
            <span className="cta-sparkle-left">✦</span>
            <span className="cta-sparkle-right">✦</span>

            <span className="final-cta-badge">EXPERIENCE THE ARCADE</span>
            <h2 className="final-cta-title">READY TO FIX THE FLOW?</h2>
            <p className="final-cta-subtitle">
              Jump into the Mumbai-to-Pune railway station. 2 minutes. No account needed. 100% accessible.
            </p>

            <div className="final-cta-buttons">
              <Button
                variant="primary"
                size="lg"
                onClick={onStartMission}
                className="final-cta-primary"
              >
                ENTER FRICTION ARCADE →
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={onPlayWithout3D}
                className="final-cta-secondary"
              >
                PLAY WITHOUT 3D
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="site-footer" id="about" role="contentinfo">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">
              <Icons.Train size={24} color="#FFD23F" />
              <span className="footer-title">FRICTION ARCADE</span>
            </div>
            <p className="footer-tagline">
              “Spot the friction. Fix the flow.” A game that teaches human-centered interface design through active exploration.
            </p>
            <div className="footer-badge-strip">
              <span className="footer-pill">HYPERBLOOM OCTOBER 2026</span>
              <span className="footer-pill">WCAG AA COMPLIANT</span>
              <span className="footer-pill">ZERO-DEPENDENCY 3D</span>
            </div>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h4 className="footer-heading">NAVIGATION</h4>
              <ul className="footer-list">
                <li><button type="button" onClick={() => scrollToSection('hero')}>Top of Page</button></li>
                <li><button type="button" onClick={() => scrollToSection('story')}>Why Friction</button></li>
                <li><button type="button" onClick={() => scrollToSection('the-experience')}>The Experience</button></li>
                <li><button type="button" onClick={() => scrollToSection('principles')}>Design Principles</button></li>
                <li><button type="button" onClick={() => scrollToSection('design-lab')}>Interactive Lab</button></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4 className="footer-heading">AUTHOR & CREATIVE</h4>
              <ul className="footer-list">
                <li><strong>Creator:</strong> AJRathod</li>
                <li><strong>Email:</strong> <a href="mailto:ajaybr2021@gmail.com">ajaybr2021@gmail.com</a></li>
                <li><strong>License:</strong> MIT</li>
                <li><button type="button" onClick={onStartMission} className="footer-play-link">Start Solo Mission →</button></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© 2026 FRICTION ARCADE · Built for Hyperbloom October · Created by AJRathod</p>
        </div>
      </footer>
    </div>
  );
};
