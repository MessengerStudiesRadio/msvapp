import React from 'react';

const YouTubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}>
    <path 
      d="M12.04 4.5C7 4.5 4.5 7 4.5 12s2.5 7.5 7.54 7.5c5.02 0 7.54-2.5 7.54-7.5S17.06 4.5 12.04 4.5zM9.75 15.5V8.5l6 3.5-6 3.5z"
    />
  </svg>
);

export default YouTubeIcon;
