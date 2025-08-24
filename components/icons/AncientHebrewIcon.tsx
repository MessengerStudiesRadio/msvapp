
import React from 'react';

const AncientHebrewIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12 L10 6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12 L10 18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 15 L20 9" />
  </svg>
);

export default AncientHebrewIcon;
