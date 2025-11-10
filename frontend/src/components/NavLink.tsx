import React, { useState } from 'react';
import Link from 'next/link';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  gradientClass: string;
  className?: string;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({
  href,
  children,
  gradientClass,
  className = '',
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      className={`${className} ${isHovered ? gradientClass : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default NavLink;
