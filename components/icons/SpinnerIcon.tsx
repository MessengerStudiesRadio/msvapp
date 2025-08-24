import React from 'react';

const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      d="M12 21a9 9 0 100-18 9 9 0 000 18z"
      stroke="currentColor"
      strokeOpacity=".25"
      strokeWidth="4"
    />
    <path
      d="M12 2a9 9 0 019 9"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="4"
    />
  </svg>
);

export default SpinnerIcon;
