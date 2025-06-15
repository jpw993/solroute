
'use client';

import { LogoIcon } from '@/components/icons/logo-icon';

export function LandingAnimation() {
  return (
    <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-background">
      <style jsx>{`
        .logo-container-animate {
          animation: appear-and-subtle-pulse 2.8s ease-in-out forwards;
          display: flex; /* Ensure content inside is usable for layout */
          justify-content: center; /* Center LogoIcon if it's smaller */
          align-items: center; /* Center LogoIcon */
        }
        @keyframes appear-and-subtle-pulse {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          30% { /* Appear */
            opacity: 1;
            transform: scale(1.1);
          }
          50% { /* Settle */
            opacity: 1;
            transform: scale(1);
          }
          70% { /* Start subtle pulse */
            transform: scale(1.02);
          }
          100% { /* End subtle pulse, stay visible */
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      <div className="logo-container-animate">
        {/* Display logo larger for the splash screen */}
        <LogoIcon style={{ width: '350px', height: 'auto' }} /> {/* Increased logo size significantly */}
      </div>
      <p className="mt-8 text-lg md:text-xl font-medium text-primary animate-pulse text-center px-4">
        Machine Learning powered DEX routing {/* Slogan */}
      </p>
    </div>
  );
}
