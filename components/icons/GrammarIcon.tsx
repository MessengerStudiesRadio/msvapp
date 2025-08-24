
import React from 'react';

const GrammarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
    />
    <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 14.25
           L17.25 19.5
           M15 19.5
           L19.5 19.5
           M15 16.5
           L19.5 16.5"
    />
  </svg>
);

export default GrammarIcon;