import React from 'react';
import { Icons } from './ui/Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-brand-col">
          <div className="footer-brand-row">
            <div className="brand-icon-box">
              <Icons.Gamepad size={22} color="#FFFFFF" />
            </div>
            <span className="footer-brand-title">FRICTION ARCADE</span>
          </div>
          <p className="footer-tagline">
            “Spot the friction. Fix the flow.”
          </p>
          <p className="footer-explanation">
            An interactive educational transit game exploring practical interface design, accessibility, and human-centered engineering.
          </p>
        </div>

        <div className="footer-meta-col">
          <h4 className="footer-heading">PROJECT & AUTHORSHIP</h4>
          <p className="footer-credit">
            Created with passion by <strong>AJRathod</strong>
          </p>
          <p className="footer-email">
            Contact:{' '}
            <a
              href="mailto:ajaybr2021@gmail.com"
              className="footer-email-link"
            >
              ajaybr2021@gmail.com
            </a>
          </p>
          <div className="footer-a11y-notice">
            <span>✓ Built with accessible HTML, WCAG AA contrast & self-hosted fonts.</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <span>© 2026 FRICTION ARCADE. All booking simulations use fictional transit data. No payment or personal data is collected.</span>
      </div>
    </footer>
  );
};
