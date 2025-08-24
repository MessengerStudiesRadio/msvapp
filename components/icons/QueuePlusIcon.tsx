
import React from 'react';

const QueuePlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.25 4.5h7.5a2.25 2.25 0 012.25 2.25v3.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 1.5v6M15 4.5h6" />
  </svg>
);

export default QueuePlusIcon;
