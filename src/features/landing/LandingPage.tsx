import React, { useState } from 'react';
import { StationHeroIllustration } from './StationHeroIllustration';
import { FrictionTriadInteractive } from './FrictionTriadInteractive';
import { TheClaritySwitch } from './TheClaritySwitch';
import { DesignLabSection } from '../repair-lab/DesignLabSection';
import { DESIGN_RULES } from '../../data/missionData';
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
      {/* ---------------- 1. POLISHED COMPACT HEADER ---------------- */}
      <header className="site-header" role="banner">
        <div className="header-container">
          <a href="#hero" className="header-brand" aria-label="Friction Arcade Homepage">
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
            <button type="button" className="nav-link-btn" onClick={() => scrollToSection('clarity-section')}>
              The Clarity Switch
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
              className="header-cta-btn"
            >
              PLAY THE MISSION →
            </Button>
            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
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
            <button type="button" className="mobile-nav-item" onClick={() => scrollToSection('clarity-section')}>
              The Clarity Switch
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
        {/* ---------------- 2. HERO: PREMIUM I-POP POSTER MEETS RAILWAY ADVENTURE ---------------- */}
        <section className="hero-section" id="hero" aria-label="Hero Section">
          <div className="hero-editorial-container">
            {/* Left Column: I-Pop Display Typography & Narrative */}
            <div className="hero-editorial-left">
              {/* Sticker Tag */}
              <div className="hero-sticker-row">
                <span className="hero-train-sticker">
                  ⚡ THE LAST TRAIN IS WAITING.
                </span>
                <span className="hero-meta-badge">
                  2 MINUTES · 3 FRICTION POINTS · 1 CLEARER JOURNEY
                </span>
              </div>

              {/* Glossy I-Pop Display Title */}
              <h1 className="hero-ipop-display-title">
                <span className="ipop-word-friction">FRICTION</span>
                <br />
                <span className="ipop-word-arcade">ARCADE</span>
              </h1>

              {/* Sub-Brand Tagline */}
              <div className="hero-tagline-strip">
                <span className="tagline-spot">SPOT THE FRICTION.</span>{' '}
                <span className="tagline-fix">FIX THE FLOW.</span>
              </div>

              {/* Supporting Copy */}
              <p className="hero-supporting-copy">
                Three confusing design choices stand between you and your ticket. Discover why they frustrate people—and learn how to make the journey clearer.
              </p>

              {/* CTAs */}
              <div className="hero-action-row">
                <button
                  type="button"
                  className="btn-hero-primary"
                  onClick={onStartMission}
                  id="hero-start-mission-main-btn"
                >
                  START THE MISSION →
                </button>

                <button
                  type="button"
                  className="btn-hero-secondary"
                  onClick={() => scrollToSection('story')}
                  id="hero-see-how-btn"
                >
                  SEE HOW IT WORKS ↓
                </button>
              </div>

              {/* 3 Compact Visual Tags */}
              <div className="hero-tags-trio">
                <div className="hero-tag-item tag-missing">
                  <span className="tag-dot" />
                  <span>MISSING CONTEXT</span>
                </div>
                <div className="hero-tag-item tag-feedback">
                  <span className="tag-dot" />
                  <span>CONFUSING FEEDBACK</span>
                </div>
                <div className="hero-tag-item tag-actions">
                  <span className="tag-dot" />
                  <span>UNCLEAR ACTIONS</span>
                </div>
              </div>

              {/* 2D Accessible Alternative Link */}
              <div className="hero-accessible-hint">
                <span>Looking for a lightweight non-3D mode?</span>{' '}
                <button
                  type="button"
                  className="accessible-mode-link"
                  onClick={onPlayWithout3D}
                >
                  Play Full 2D Adventure →
                </button>
              </div>
            </div>

            {/* Right Column: Seamless Cinematic Illustration */}
            <div className="hero-editorial-right">
              <StationHeroIllustration />
            </div>
          </div>
        </section>

        {/* ---------------- 3. SECTION A: SMALL DESIGN PROBLEMS. REAL FRUSTRATION. ---------------- */}
        <section className="section-friction-story" id="story" aria-label="Small Design Problems">
          <div className="editorial-container">
            <div className="section-eyebrow-center">
              <span className="editorial-kicker">THE PROBLEM</span>
              <h2 className="editorial-section-title">
                SMALL DESIGN PROBLEMS. REAL FRUSTRATION.
              </h2>
              <p className="editorial-section-subtitle">
                Bad UX doesn't always announce itself with broken code. It sneaks in as vanishing field context, cryptic error messages, and competing buttons that make travelers second-guess themselves.
              </p>
            </div>

            {/* Interactive Triad with Real Heuristic Reveals */}
            <FrictionTriadInteractive />
          </div>
        </section>

        {/* ---------------- 4. SECTION B: THE JOURNEY (4 STAGES + PROGRESSIVE ROUTE) ---------------- */}
        <section className="section-experience-journey" id="the-experience" aria-label="The Journey">
          <div className="editorial-container">
            <div className="section-eyebrow-center">
              <span className="editorial-kicker">THE PLAYER JOURNEY</span>
              <h2 className="editorial-section-title">
                FROM CONFUSED TRAVELER TO CONFIDENT DESIGNER.
              </h2>
              <p className="editorial-section-subtitle">
                Friction Arcade doesn't just list heuristics—it puts you in the shoes of someone desperately trying to catch the last train home.
              </p>
            </div>

            {/* Illustrated Progressive Railway Route */}
            <div className="railway-route-map" aria-hidden="true">
              <div className="route-track-line" />
              <div className="route-train-token">🚆</div>
            </div>

            <div className="journey-stages-grid">
              <div className="journey-stage-card stage-1">
                <div className="stage-token">1</div>
                <div className="stage-meta">STEP 01 · EXPLORATION</div>
                <h3 className="stage-title">Discover the Problem</h3>
                <p className="stage-desc">
                  Explore a bustling railway station concourse in third person. Spot real interface bugs at the ticket kiosk, departure board, and help desk using Friction Vision.
                </p>
              </div>

              <div className="journey-stage-card stage-2">
                <div className="stage-token">2</div>
                <div className="stage-meta">STEP 02 · INVESTIGATION</div>
                <h3 className="stage-title">Understand Why It Matters</h3>
                <p className="stage-desc">
                  Interview commuter NPCs—Arjun, Meera, and Kabir—to witness how vanishing labels, color-only errors, and missing hierarchy block real passengers from boarding.
                </p>
              </div>

              <div className="journey-stage-card stage-3">
                <div className="stage-token">3</div>
                <div className="stage-meta">STEP 03 · REPAIR LAB</div>
                <h3 className="stage-title">Apply the Repair</h3>
                <p className="stage-desc">
                  Enter Designer Mode. Solve three focused repair puzzles to swap confusing anti-patterns for WCAG-compliant, accessible design components.
                </p>
              </div>

              <div className="journey-stage-card stage-4">
                <div className="stage-token">4</div>
                <div className="stage-meta">STEP 04 · TRANSFORMATION</div>
                <h3 className="stage-title">See the Clearer Result</h3>
                <p className="stage-desc">
                  Replay the ticket booking with polished UI. Watch the station transform into Clarity Mode as relieved passengers safely board the 13:15 express train!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- 5. SECTION C: THE CLARITY SWITCH (SIGNATURE INTERACTION) ---------------- */}
        <section className="section-clarity-switch" id="clarity-section" aria-label="The Clarity Switch">
          <div className="editorial-container">
            <TheClaritySwitch />
          </div>
        </section>

        {/* ---------------- 6. SECTION D: DESIGN PRINCIPLES ---------------- */}
        <section className="section-design-principles" id="principles" aria-label="Design Principles">
          <div className="editorial-container">
            <div className="section-eyebrow-center">
              <span className="editorial-kicker">CORE HEURISTICS</span>
              <h2 className="editorial-section-title">8 Principles for Clearer Journeys</h2>
              <p className="editorial-section-subtitle">
                Keep these human-centered rules top-of-mind whenever you build forms, flows, and digital products people rely on.
              </p>
            </div>

            <div className="principles-cards-grid">
              {DESIGN_RULES.map((rule) => (
                <div
                  key={rule.id}
                  className="principle-card"
                  style={{ borderTop: `5px solid ${rule.color}` }}
                >
                  <div className="principle-card-head">
                    <span className="principle-num" style={{ backgroundColor: rule.color }}>
                      {rule.id}
                    </span>
                    <span className="principle-sub">{rule.subtitle}</span>
                  </div>
                  <h3 className="principle-title">{rule.title}</h3>
                  <p className="principle-desc">{rule.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- 7. INTERACTIVE DESIGN LAB SANDBOX ---------------- */}
        <section className="section-design-lab" id="design-lab" aria-label="Interactive Sandbox">
          <DesignLabSection />
        </section>

        {/* ---------------- 8. SECTION E: FINAL CALL TO ACTION ---------------- */}
        <section className="section-final-cta" id="cta" aria-label="Final Call to Action">
          <div className="final-cta-container">
            <div className="final-cta-poster">
              <span className="poster-sparkle sp-left">✦</span>
              <span className="poster-sparkle sp-right">✦</span>

              <span className="final-cta-kicker">YOUR TICKET IS WAITING</span>
              <h2 className="final-cta-headline">MAKE THE JOURNEY CLEARER.</h2>
              <p className="final-cta-subline">
                Ready to find the friction and fix the flow? Jump straight into the railway concourse—2 minutes, no login, 100% accessible.
              </p>

              <div className="final-cta-btn-group">
                <button
                  type="button"
                  className="btn-final-primary"
                  onClick={onStartMission}
                  id="final-cta-start-btn"
                >
                  START THE MISSION →
                </button>
                <button
                  type="button"
                  className="btn-final-secondary"
                  onClick={onPlayWithout3D}
                >
                  PLAY 2D MODE
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---------------- 9. REBUILT SIGNATURE CREATOR FOOTER ---------------- */}
      <footer className="signature-creator-footer" id="about" role="contentinfo">
        <div className="footer-cream-container">
          {/* Top Editorial Row */}
          <div className="footer-headline-row">
            <div className="footer-title-block">
              <h3 className="footer-graffiti-headline">BUILT BY AJAY RATHOD</h3>
              <div className="footer-annotation-sticker">
                <span className="sticker-icon">✍️</span>
                <span>Made to make the web less frustrating.</span>
              </div>
            </div>

            <div className="footer-badge-strip">
              <span className="footer-pill-tag">HYPERBLOOM OCTOBER 2026</span>
              <span className="footer-pill-tag">WCAG AA CERTIFIED</span>
              <span className="footer-pill-tag">ZERO DEPENDENCY 3D</span>
            </div>
          </div>

          {/* Middle Details Grid */}
          <div className="footer-details-grid">
            {/* Col 1: About the Mission */}
            <div className="footer-info-col">
              <div className="footer-brand-lockup">
                <Icons.Train size={22} color="#FF8A1F" />
                <span className="footer-brand-text">FRICTION ARCADE</span>
              </div>
              <p className="footer-mission-statement">
                “Spot the friction. Fix the flow.” An interactive educational transit adventure teaching practical interface design, accessibility heuristics, and human-centered engineering.
              </p>
            </div>

            {/* Col 2: Navigation Links */}
            <div className="footer-nav-col">
              <h4 className="footer-col-heading">EXPEDITION</h4>
              <ul className="footer-clean-list">
                <li><button type="button" onClick={() => scrollToSection('hero')}>Top of Page</button></li>
                <li><button type="button" onClick={() => scrollToSection('story')}>Why Friction</button></li>
                <li><button type="button" onClick={() => scrollToSection('the-experience')}>The Experience</button></li>
                <li><button type="button" onClick={() => scrollToSection('clarity-section')}>The Clarity Switch</button></li>
                <li><button type="button" onClick={() => scrollToSection('principles')}>Design Principles</button></li>
                <li><button type="button" onClick={() => scrollToSection('design-lab')}>Interactive Lab</button></li>
              </ul>
            </div>

            {/* Col 3: Creator & Contact */}
            <div className="footer-author-col">
              <h4 className="footer-col-heading">CREATOR & CONTACT</h4>
              <div className="footer-author-details">
                <div className="author-row">
                  <span className="author-label">Creator:</span>
                  <span className="author-val">Ajay Rathod</span>
                </div>
                <div className="author-row">
                  <span className="author-label">Email:</span>
                  <a href="mailto:ajaybr2021@gmail.com" className="author-email-link">
                    ajaybr2021@gmail.com
                  </a>
                </div>
                <div className="author-row">
                  <span className="author-label">Context:</span>
                  <span className="author-val">Hyperbloom October 2026</span>
                </div>
              </div>

              <button
                type="button"
                className="footer-start-pill"
                onClick={onStartMission}
              >
                <span>Board The Train Now</span>
                <Icons.ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="footer-bottom-strap">
            <p className="strap-text">
              © 2026 FRICTION ARCADE · Created by Ajay Rathod for Hyperbloom October · Fictional transit simulations for UX education.
            </p>
            <div className="strap-ticket-mark">
              🎟️ <span>TICKET NO. 042 · CONFIRMED</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
