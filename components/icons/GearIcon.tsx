
import React from 'react';

const GearIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M9.594 3.94c.09-.542.56-1.007 1.11-1.226.554-.225 1.151-.242 1.709-.045.562.199 1.044.57 1.343 1.054.298.483.448 1.037.448 1.622s-.15 1.14-.448 1.622c-.299.484-.781.855-1.343 1.054-.558.197-1.155.18-1.709-.045-.55-.219-1.02-.684-1.11-1.226a4.502 4.502 0 010-3.244zM19.5 12a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" 
    />
  </svg>
);

export default GearIcon;
