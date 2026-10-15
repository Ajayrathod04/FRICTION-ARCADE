import React, { useState } from 'react';
import { Toggle } from '../../components/ui/Toggle';
import { Badge } from '../../components/ui/Badge';
import { Icons } from '../../components/ui/Icons';

export const DesignLabSection: React.FC = () => {
  const [persistentLabels, setPersistentLabels] = useState(true);
  const [inlineErrors, setInlineErrors] = useState(true);
  const [largerControls, setLargerControls] = useState(true);
  const [visibleFocus, setVisibleFocus] = useState(true);

  // Playground input state
  const [testCity, setTestCity] = useState('');
  const [isTouched, setIsTouched] = useState(false);

  const isCityValid = testCity.trim().length >= 3;

  return (
    <section className="design-lab-section" id="design-lab" aria-labelledby="design-lab-title">
      <div className="section-container">
        <div className="section-header">
          <Badge variant="sticker" color="#B6FFB2" rotate={-1}>
            🛠 INTERACTIVE SANDBOX
          </Badge>
          <h2 id="design-lab-title" className="section-title">
            The Design Lab
          </h2>
          <p className="section-subtitle">
            Toggle interface rules on and off below to see how tiny design decisions make or break the user experience in real time.
          </p>
        </div>

        <div className="design-lab-grid">
          {/* Toggles Panel */}
          <div className="design-lab-controls">
            <h3 className="lab-panel-title">Interface Switches</h3>

            <div className="toggle-stack">
              <Toggle
                id="toggle-labels"
                checked={persistentLabels}
                onChange={setPersistentLabels}
                label="Persistent Field Labels"
                description="Labels stay visible above inputs so travelers don't lose context while typing."
                icon={<Icons.Tag size={18} color="#FF8A1F" />}
              />

              <Toggle
                id="toggle-errors"
                checked={inlineErrors}
                onChange={setInlineErrors}
                label="Actionable Inline Feedback"
                description="Specific text and icons explain what failed and how to correct it immediately."
                icon={<Icons.Alert size={18} color="#FF3B30" />}
              />

              <Toggle
                id="toggle-size"
                checked={largerControls}
                onChange={setLargerControls}
                label="Generous Touch Targets (48px)"
                description="Large tap zones prevent accidental slips on mobile and assist motor control."
                icon={<Icons.Target size={18} color="#8DDCFF" />}
              />

              <Toggle
                id="toggle-focus"
                checked={visibleFocus}
                onChange={setVisibleFocus}
                label="High-Contrast Focus Outlines"
                description="Clear 3px ink focus ring ensures keyboard travelers never lose their place."
                icon={<Icons.Keyboard size={18} color="#B6FFB2" />}
              />
            </div>
          </div>

          {/* Live Preview Playground */}
          <div className="design-lab-preview">
            <div className="preview-top-bar">
              <span className="preview-dot red" />
              <span className="preview-dot yellow" />
              <span className="preview-dot green" />
              <span className="preview-title">Live Component Preview</span>
            </div>

            <div className="preview-content">
              <div
                className={`lab-test-form ${largerControls ? 'lab-test-form--large' : 'lab-test-form--small'} ${visibleFocus ? 'lab-test-form--focus-ring' : 'lab-test-form--no-focus'}`}
              >
                <div className="lab-field-unit">
                  {persistentLabels ? (
                    <label htmlFor="lab-input" className="lab-persistent-label">
                      Departure Station <span className="req">*</span>
                    </label>
                  ) : null}

                  <input
                    id="lab-input"
                    type="text"
                    value={testCity}
                    onChange={(e) => setTestCity(e.target.value)}
                    onBlur={() => setIsTouched(true)}
                    placeholder={persistentLabels ? 'e.g. Mumbai CST' : 'departure station (e.g. Mumbai)'}
                    className={`lab-input ${isTouched && !isCityValid && inlineErrors ? 'lab-input--error' : ''} ${isTouched && isCityValid && inlineErrors ? 'lab-input--valid' : ''}`}
                    aria-label={!persistentLabels ? 'Departure station' : undefined}
                  />

                  {/* Inline feedback state */}
                  {inlineErrors && isTouched && !isCityValid && (
                    <div className="lab-inline-error" role="alert">
                      <Icons.Alert size={16} color="#FF3B30" />
                      <span>Please enter at least 3 characters for station name.</span>
                    </div>
                  )}

                  {inlineErrors && isTouched && isCityValid && (
                    <div className="lab-inline-valid">
                      <Icons.Check size={16} color="#059669" />
                      <span>Looks great! Valid station selected.</span>
                    </div>
                  )}

                  {!inlineErrors && isTouched && !isCityValid && (
                    <div className="lab-cryptic-error">
                      <span>! Error</span>
                    </div>
                  )}
                </div>

                <div className="lab-action-row">
                  <button
                    type="button"
                    className="lab-cta-btn"
                    onClick={() => setIsTouched(true)}
                  >
                    Check Input Flow →
                  </button>
                  <button
                    type="button"
                    className="lab-reset-btn"
                    onClick={() => {
                      setTestCity('');
                      setIsTouched(false);
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="preview-status-strip">
                <span className="strip-item">
                  Label state: <strong>{persistentLabels ? 'Visible Above' : 'Ghost Placeholder'}</strong>
                </span>
                <span className="strip-item">
                  Touch Target: <strong>{largerControls ? '48px (Accessible)' : '32px (Cramped)'}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
