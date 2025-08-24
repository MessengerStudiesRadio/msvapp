
import React from 'react';

const RepeatOneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path 
        fillRule="evenodd" 
        d="M16.023 16.023h3.75V19.5m-2.25-2.25l-3.75 3.75M3.75 19.5h3.75v-3.75M5.25 17.25l3.75-3.75M3.75 4.5h3.75v3.75M5.25 6.75l3.75 3.75m11.25-3.75h-3.75V4.5m2.25 2.25l3.75-3.75" 
        clipRule="evenodd" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
    />
    <path 
        d="M12.375 12h-1.5v-3.75a.75.75 0 011.5 0V12zM12 15a.75.75 0 00-.75-.75h-1.5a.75.75 0 000 1.5h.75V12h.75a.75.75 0 00.75-.75v-3a.75.75 0 00-.75-.75h-1.5a.75.75 0 00-.75.75V9" 
        transform="translate(0 -1)"
    />
  </svg>
);

export default RepeatOneIcon;
