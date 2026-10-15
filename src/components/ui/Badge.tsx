import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pill' | 'sticker' | 'tag';
  color?: string;
  rotate?: number;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'sticker',
  color = '#FFD23F',
  rotate = 0,
  className = '',
  icon,
}) => {
  const style: React.CSSProperties = {
    backgroundColor: color,
    transform: rotate ? `rotate(${rotate}deg)` : undefined,
  };

  return (
    <span
      className={`badge-arcade badge-arcade--${variant} ${className}`}
      style={style}
    >
      {icon && <span className="badge-arcade__icon" aria-hidden="true">{icon}</span>}
      <span className="badge-arcade__text">{children}</span>
    </span>
  );
};
