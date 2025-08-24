import React from 'react';

const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}>
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962A3.375 3.375 0 0110.5 12h3a3.375 3.375 0 013.369 3.369m-3.375 0c0 .442.072.875.21 1.285M11.25 10.5a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M6.375 18.375a9.094 9.094 0 01-3.741-.479 3 3 0 01-4.682-2.72M6.375 18.375a9.094 9.094 0 003.741.479 3 3 0 004.682 2.72M6.375 18.375V18m11.25 3.375V18m0 0a3 3 0 00-3-3h-3a3 3 0 00-3 3m0 0V18" />
  </svg>
);

export default UserGroupIcon;
