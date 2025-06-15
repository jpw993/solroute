import type { SVGProps } from 'react';

export function RaydiumIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="10" fill="#46D8C2"/>
      <path d="M12 5V7M12 17V19M17.65 6.35L16.24 7.76M7.76 16.24L6.35 17.65M19 12H17M7 12H5M17.65 17.65L16.24 16.24M7.76 7.76L6.35 6.35" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9.5 10.5C9.5 9.67157 10.1716 9 11 9H13C14.3807 9 15.5 10.1193 15.5 11.5C15.5 12.8807 14.3807 14 13 14H11.5V15.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
