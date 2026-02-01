import type { SVGProps } from "react";

/** Filter (réglages) - viewBox 24x24 */
export const FilterIcon = ({ 
  size = 24, 
  className = "", 
  ...props 
}: SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={`flex-shrink-0 ${className}`} 
    {...props}
  >
    <g clipPath="url(#clip0_filter)">
      <circle cx="5.5" cy="6.5" r="3.5" stroke="currentColor" strokeWidth="1.75" />
    </g>
    <rect x="2" y="3" width="20" height="7" rx="3.5" stroke="currentColor" strokeWidth="1.75" />
    <g clipPath="url(#clip1_filter)">
      <circle cx="18.5" cy="17.5" r="3.5" stroke="currentColor" strokeWidth="1.75" />
    </g>
    <rect x="2" y="14" width="20" height="7" rx="3.5" stroke="currentColor" strokeWidth="1.75" />
    <defs>
      <clipPath id="clip0_filter">
        <rect x="2" y="3" width="20" height="7" rx="3.5" fill="white" />
      </clipPath>
      <clipPath id="clip1_filter">
        <rect x="2" y="14" width="20" height="7" rx="3.5" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
