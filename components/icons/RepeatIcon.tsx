
import React from 'react';

const RepeatIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M16.023 16.023h3.75V19.5m-2.25-2.25l-3.75 3.75M3.75 19.5h3.75v-3.75M5.25 17.25l3.75-3.75M3.75 4.5h3.75v3.75M5.25 6.75l3.75 3.75m11.25-3.75h-3.75V4.5m2.25 2.25l3.75-3.75" 
    />
  </svg>
);

export default RepeatIcon;
