import React from 'react';

interface ToggleProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export const Toggle: React.FC<ToggleProps> = ({
  id,
  checked,
  onChange,
  label,
  description,
  icon,
}) => {
  return (
    <label htmlFor={id} className="toggle-wrapper">
      <div className="toggle-content">
        <div className="toggle-label-row">
          {icon && <span className="toggle-icon">{icon}</span>}
          <span className="toggle-label">{label}</span>
        </div>
        {description && <span className="toggle-description">{description}</span>}
      </div>
      <div className="toggle-switch-container">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="toggle-input"
          role="switch"
          aria-checked={checked}
        />
        <span className="toggle-track">
          <span className="toggle-thumb" />
        </span>
      </div>
    </label>
  );
};
