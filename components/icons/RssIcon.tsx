
import React from 'react';

const RssIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5h-.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 11.25v-.75a3.75 3.75 0 00-3.75-3.75h-.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 6.75A.75.75 0 016 6h.75a.75.75 0 01.75.75v.75a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75V6.75z" />
  </svg>
);

export default RssIcon;