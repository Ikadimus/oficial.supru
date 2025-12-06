
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

type BaseProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

type ButtonAsButton = BaseProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
  as?: 'button';
};

type ButtonAsLink = BaseProps & Omit<LinkProps, keyof BaseProps> & {
  as: 'link';
  to: string;
};

type ButtonProps = ButtonAsButton | ButtonAsLink;

const Button: React.FC<ButtonProps> = (props) => {
  const { variant = 'primary', className = '', children, disabled = false, ...rest } = props;

  const baseStyles = 'inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
  
  const variantStyles = {
    primary: 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${disabled ? disabledStyles : ''} ${className}`;

  if (props.as === 'link') {
    const { to, ...linkProps } = rest as Omit<ButtonAsLink, 'as' | 'children' | 'variant' | 'className' | 'disabled'>;
    return (
      <Link to={to} className={combinedClassName} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { onClick, type = 'button' } = props;
  return (
    <button type={type} className={combinedClassName} onClick={onClick} disabled={disabled} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
};

export default Button;
