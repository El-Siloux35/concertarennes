import type { SVGProps } from "react";

/** Flèche retour - viewBox 24x24, d'après retour.svg */
export const RetourIcon = ({
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
    <path
      d="M14 6C14 6 8.00001 10.4189 8 12C7.99999 13.5812 14 18 14 18"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
