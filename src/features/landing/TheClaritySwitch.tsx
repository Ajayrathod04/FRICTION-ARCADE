import React, { useState } from 'react';
import { Icons } from '../../components/ui/Icons';
import { SoundEffects } from '../../lib/audio';

export const TheClaritySwitch: React.FC = () => {
  const [isClear, setIsClear] = useState(false);
  const [stampActive, setStampActive] = useState(false);

  const handleToggle = () => {
    const nextState = !isClear;
    setIsClear(nextState);
    if (nextState) {
      setStampActive(true);
      try {
        SoundEffects.playCollect();
      } catch {
        // audio fallback
      }
      setTimeout(() => setStampActive(false), 800);
    } else {
      try {
        SoundEffects.playBlip();
      } catch {
        // audio fallback
      }
    }
  };

  return (
    <div className="clarity-switch-card" id="clarity-switch">
      <div className="clarity-switch-header">
        <div className="clarity-switch-badge-row">
          <span className="clarity-pill">INTERACTIVE LESSON</span>
          <span className="clarity-subpill">THE CLARITY SWITCH</span>
        </div>
        <h3 className="clarity-switch-title">See Friction Disappear in Real Time</h3>
        <p className="clarity-switch-intro">
          Vague errors leave travelers stranded. Actionable guidance tells people exactly what went wrong and how to fix it in seconds.
        </p>
      </div>

      <div className="clarity-switch-stage">
        {/* Toggle Controls */}
        <div className="clarity-toggle-bar">
          <span className={`toggle-state-label ${!isClear ? 'is-active' : ''}`}>
            BEFORE (FRICTION)
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isClear}
            onClick={handleToggle}
            className={`clarity-switch-btn ${isClear ? 'clarity-switch-btn--on' : ''}`}
            aria-label="Toggle between ambiguous error and clear, actionable feedback"
            id="clarity-switch-toggle"
          >
            <span className="switch-thumb" />
          </button>
          <span className={`toggle-state-label ${isClear ? 'is-active is-success' : ''}`}>
            AFTER (CLARITY)
          </span>
        </div>

        {/* Live Display Panel */}
        <div className={`clarity-demonstrator ${isClear ? 'demonstrator--clear' : 'demonstrator--friction'}`}>
          <div className="demonstrator-top-tab">
            <span className="demonstrator-status-dot" />
            <span className="demonstrator-tab-text">
              {isClear ? '✓ Clear, Human-Centered Guidance' : '⚠️ Ambiguous Interface Error'}
            </span>
          </div>

          <div className="demonstrator-body">
            <div className="demonstrator-field-mock">
              <label className="demonstrator-label" htmlFor="mock-date-input">
                Departure Date <span className="req-star">*</span>
              </label>
              <div className="demonstrator-input-box">
                <input
                  id="mock-date-input"
                  type="text"
                  readOnly
                  value={isClear ? '17 Oct 2026 · Saturday' : ''}
                  placeholder={isClear ? '' : 'Enter date...'}
                  className={`demonstrator-input ${isClear ? 'input--valid' : 'input--error'}`}
                />
                <span className="demonstrator-input-icon">
                  {isClear ? <Icons.Check size={18} color="#059669" /> : <Icons.Alert size={18} color="#FF3B30" />}
                </span>
              </div>
            </div>

            {/* Error / Guidance Message Box */}
            <div
              className={`demonstrator-message-bubble ${isClear ? 'bubble--clear' : 'bubble--friction'}`}
              role="status"
              aria-live="polite"
            >
              <div className="message-icon-frame">
                {isClear ? (
                  <Icons.Check size={22} color="#059669" />
                ) : (
                  <Icons.Alert size={22} color="#FF3B30" />
                )}
              </div>
              <div className="message-text-group">
                <div className="message-main-text">
                  {isClear ? '“Choose a departure date to continue.”' : '“Something went wrong.”'}
                </div>
                <div className="message-sub-text">
                  {isClear
                    ? 'Actionable: Explains the exact required input so the traveler can immediately select Saturday and proceed.'
                    : 'Cryptic: Fails to identify which field failed, provides zero guidance, and leaves the traveler guessing.'}
                </div>
              </div>
            </div>

            {/* Stamp Animation on Success */}
            {isClear && (
              <div className={`clarity-stamp-badge ${stampActive ? 'stamp-slam' : ''}`}>
                <div className="stamp-inner">
                  <span className="stamp-star">★</span>
                  <span className="stamp-text">CLARITY VERIFIED</span>
                  <span className="stamp-sub">FLOW RESTORED</span>
                </div>
              </div>
            )}
          </div>

          {/* Educational Heuristic Explainer */}
          <div className="demonstrator-footer">
            <div className="heuristic-tag">
              <span className="heuristic-icon">💡</span>
              <span className="heuristic-title">
                {isClear
                  ? 'UX Rule: Help users recognize, diagnose, and recover from errors (Nielsen Heuristic #9)'
                  : 'Anti-pattern: Generic error messaging increases cognitive load and causes cart abandonment.'}
              </span>
            </div>
            <button
              type="button"
              className="clarity-flip-btn"
              onClick={handleToggle}
            >
              {isClear ? '← Switch Back to Friction' : 'Apply Clarity Fix →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
