
import React, { useId } from 'react';

const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
    const idSuffix = useId();
    const orangeGradientId = `orangeGradient-${idSuffix}`;
    const diagonalPatternId = `diagonalPattern-${idSuffix}`;
    const blackGradientId = `blackGradient-${idSuffix}`;

    return (
        <svg viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg" {...props}>
            <defs>
                <linearGradient id={orangeGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" className="stop1" />
                    <stop offset="100%" className="stop2" />
                </linearGradient>
                <pattern id={diagonalPatternId} patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(35)">
                    <line x1="0" y1="0" x2="0" y2="10" style={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 4 }} />
                </pattern>
                <linearGradient id={blackGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#333" />
                    <stop offset="50%" stopColor="#000" />
                    <stop offset="100%" stopColor="#333" />
                </linearGradient>
                <style>
                    {`
                    .seekers-font { font-family: 'Arial Black', Gadget, sans-serif; font-weight: 900; fill: black; text-anchor: middle; }
                    .ministries-font { font-family: 'Arial Narrow', Arial, sans-serif; font-weight: bold; fill: white; text-anchor: middle; letter-spacing: 1.5px; }
                    .radio-font { font-family: 'Arial', sans-serif; font-weight: bold; fill: black; text-anchor: middle; letter-spacing: 1px; }
                    .stop1 { stop-color: rgb(var(--color-primary-400)); }
                    .stop2 { stop-color: rgb(var(--color-primary-500)); }
                    .side-stroke { stroke: rgb(var(--color-primary-400)); }
                    `}
                </style>
            </defs>
    
            {/* Base Shape */}
            <g>
                <polygon points="0,100 100,0 700,0 800,100 700,200 100,200" fill="#212121" />
                <polygon points="5,100 102.5,5 697.5,5 795,100 697.5,195 102.5,195" fill="black" />
                <polygon points="10,100 105,10 695,10 790,100 695,190 105,190" fill={`url(#${orangeGradientId})`} />
                <polygon points="10,100 105,10 695,10 790,100 695,190 105,190" fill={`url(#${diagonalPatternId})`} />
            </g>
            
            {/* Center element for 'MINISTRIES' */}
            <path d="M220 80 L 580 80 Q 595 100 580 120 L 220 120 Q 205 100 220 80 Z" fill={`url(#${blackGradientId})`} />
            
            {/* Decorative side elements */}
            <g>
                {/* Left */}
                <path d="M120 80 L 200 80 L 190 120 L 110 120 Z" fill="black" />
                <g className="side-stroke" style={{ strokeOpacity: 0.6, strokeWidth: 3 }}>
                    <path d="M128 85 L 120 115" />
                    <path d="M138 85 L 130 115" />
                    <path d="M148 85 L 140 115" />
                    <path d="M158 85 L 150 115" />
                    <path d="M168 85 L 160 115" />
                    <path d="M178 85 L 170 115" />
                    <path d="M188 85 L 180 115" />
                </g>
                 {/* Right */}
                <path d="M600 80 L 680 80 L 690 120 L 610 120 Z" fill="black" />
                 <g className="side-stroke" style={{ strokeOpacity: 0.6, strokeWidth: 3 }}>
                    <path d="M612 85 L 620 115" />
                    <path d="M622 85 L 630 115" />
                    <path d="M632 85 L 640 115" />
                    <path d="M642 85 L 650 115" />
                    <path d="M652 85 L 660 115" />
                    <path d="M662 85 L 670 115" />
                    <path d="M672 85 L 680 115" />
                </g>
            </g>
    
            {/* Text */}
            <text x="400" y="68" className="seekers-font" fontSize="40" letterSpacing="2">SEEKERS OF YAHWEH</text>
            <text x="400" y="110" className="ministries-font" fontSize="28">MINISTRIES</text>
            <text x="400" y="155" className="radio-font" fontSize="24">MESSENGER STUDIES RADIO</text>
        </svg>
    );
};

export default LogoIcon;
