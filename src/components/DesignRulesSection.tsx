import React from 'react';
import { Badge } from './ui/Badge';
import { DESIGN_RULES } from '../data/missionData';

export const DesignRulesSection: React.FC = () => {
  return (
    <section className="design-rules-section" id="design-rules" aria-labelledby="design-rules-title">
      <div className="section-container">
        <div className="section-header">
          <Badge variant="sticker" color="#FF3D8B" rotate={1}>
            TAKEAWAYS
          </Badge>
          <h2 id="design-rules-title" className="section-title">
            8 Design Rules You Just Experienced
          </h2>
          <p className="section-subtitle">
            Real problems. Practical repairs. Keep these principles in mind when building products people love to use.
          </p>
        </div>

        <div className="rules-cards-grid">
          {DESIGN_RULES.map((rule) => (
            <div
              key={rule.id}
              className="rule-card"
              style={{ borderTop: `6px solid ${rule.color}` }}
            >
              <div className="rule-card__header">
                <span className="rule-card__num" style={{ backgroundColor: rule.color }}>
                  {rule.id}
                </span>
                <span className="rule-card__sub">{rule.subtitle}</span>
              </div>
              <h3 className="rule-card__title">{rule.title}</h3>
              <p className="rule-card__desc">{rule.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
