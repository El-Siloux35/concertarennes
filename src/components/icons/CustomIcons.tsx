import type { SVGProps } from "react";

const svgClass = "flex-shrink-0";

/** Favourite (cœur) - viewBox 24x24 */
export const FavouriteIcon = ({ size = 24, className, fill = "none", ...props }: SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} className={`${svgClass} ${className ?? ""}`} {...props}>
    <path d="M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={fill === "none" ? "none" : "currentColor"} />
  </svg>
);

/** Sent (avion) - viewBox 24x24 */
export const SentIcon = ({ size = 24, className, ...props }: SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${svgClass} ${className ?? ""}`} {...props}>
    <path d="M21.0477 3.05293C18.8697 0.707361 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11.5 12.5L15 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Filter (réglages) - viewBox 24x24 */
export const FilterIcon = ({ size = 24, className, ...props }: SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${svgClass} ${className ?? ""}`} {...props}>
    <circle cx="5.5" cy="6.5" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="2" y="3" width="20" height="7" rx="3.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="18.5" cy="17.5" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="2" y="14" width="20" height="7" rx="3.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

/** Retour (flèche) - viewBox 24x24 */
export const RetourIcon = ({ size = 24, className, ...props }: SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`${svgClass} ${className ?? ""}`} {...props}>
    <path d="M14 6C14 6 8.00001 10.4189 8 12C7.99999 13.5812 14 18 14 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
