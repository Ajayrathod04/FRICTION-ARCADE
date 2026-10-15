import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'mint' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'btn-arcade';
  const variantClass = `btn-arcade--${variant}`;
  const sizeClass = `btn-arcade--${size}`;
  const disabledClass = disabled ? 'btn-arcade--disabled' : '';

  return (
    <button
      className={`${baseClasses} ${variantClass} ${sizeClass} ${disabledClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="btn-arcade__icon" aria-hidden="true">{icon}</span>}
      <span className="btn-arcade__text">{children}</span>
    </button>
  );
};
