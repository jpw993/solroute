
'use client';
import React from 'react';
import { Loader2 } from 'lucide-react';

const PathfindingAnimation: React.FC = () => {
  const nodeColor = "hsl(var(--primary))";
  const pathColor = "hsl(var(--primary))"; // Used for initial path draw
  const pulseColor = "hsl(var(--accent))";
  const mutedColor = "hsl(var(--muted))"; // For inactive/background path
  const textColor = "hsl(var(--foreground))";
  const dexBoxFillColor = "hsl(var(--secondary))";
  const dexBoxStrokeColor = "hsl(var(--border))";

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-secondary/20 rounded-lg shadow-inner h-60 md:h-72 w-full my-4">
      <div className="flex items-center text-primary mb-3">
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        <p className="text-sm font-semibold">Searching for optimal route...</p>
      </div>
      <svg viewBox="0 0 400 120" width="90%" height="90%" className="max-w-md">
        <style jsx>{`
          .node-circle { 
            fill: ${nodeColor}; 
            stroke: ${dexBoxStrokeColor}; 
            stroke-width: 1.5; 
            animation: node-appear 0.5s ease-out forwards;
            opacity: 0;
          }
          .node-circle-0 { animation-delay: 0s; }
          .node-circle-1 { animation-delay: 0.8s; }
          .node-circle-2 { animation-delay: 1.6s; }
          .node-circle-3 { animation-delay: 2.4s; }
          .node-circle-4 { animation-delay: 3.2s; }


          .node-text { 
            font-size: 10px; 
            fill: ${textColor}; 
            text-anchor: middle; 
            dominant-baseline: central; 
            animation: text-appear 0.5s ease-out forwards;
            opacity: 0;
          }
          .node-text-0 { animation-delay: 0.1s; }
          .node-text-1 { animation-delay: 0.9s; }
          .node-text-2 { animation-delay: 1.7s; }
          .node-text-3 { animation-delay: 2.5s; }
          .node-text-4 { animation-delay: 3.3s; }


          .dex-box { 
            fill: ${dexBoxFillColor}; 
            stroke: ${dexBoxStrokeColor}; 
            stroke-width: 1; 
            animation: node-appear 0.5s ease-out forwards;
            opacity: 0;
          }
          .dex-box-0 { animation-delay: 0.8s; }
          .dex-box-1 { animation-delay: 1.6s; }
          .dex-box-2 { animation-delay: 2.4s; }


          .dex-text { 
            font-size: 9px; 
            fill: ${textColor}; 
            text-anchor: middle; 
            dominant-baseline: central; 
            animation: text-appear 0.5s ease-out forwards;
            opacity: 0;
          }
          .dex-text-0 { animation-delay: 0.9s; }
          .dex-text-1 { animation-delay: 1.7s; }
          .dex-text-2 { animation-delay: 2.5s; }


          .connecting-path { 
            stroke: ${mutedColor}; 
            stroke-width: 2; 
            stroke-dasharray: 100; /* Approximate length */
            stroke-dashoffset: 100;
            animation: draw-line 0.7s ease-in-out forwards;
          }
          .path-1 { animation-delay: 0.1s; }
          .path-2 { animation-delay: 0.9s; }
          .path-3 { animation-delay: 1.7s; }
          .path-4 { animation-delay: 2.5s; }

          .pulse-line {
            stroke: ${pulseColor};
            stroke-width: 2.5;
            fill: none;
            stroke-dasharray: 8 4; /* Dashed line for pulsing effect */
            animation: pulse-effect 1.2s linear infinite;
            opacity: 0; /* Initially hidden, shown via animation delay */
          }
          .pulse-1 { animation-delay: 0.8s; animation-name: pulse-effect, fade-in-pulse; }
          .pulse-2 { animation-delay: 1.6s; animation-name: pulse-effect, fade-in-pulse; }
          .pulse-3 { animation-delay: 2.4s; animation-name: pulse-effect, fade-in-pulse; }
          .pulse-4 { animation-delay: 3.2s; animation-name: pulse-effect, fade-in-pulse; }


          @keyframes node-appear {
            from { opacity: 0; transform: scale(0.5); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes text-appear {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes draw-line {
            to { stroke-dashoffset: 0; }
          }
          @keyframes pulse-effect {
            0% { stroke-dashoffset: 24; } /* Start (length of 2 dashes + 2 gaps) */
            100% { stroke-dashoffset: 0; } /* End */
          }
          @keyframes fade-in-pulse {
            0% { opacity: 0; }
            10% { opacity: 1; } /* Fade in quickly */
            90% { opacity: 1; }
            100% { opacity: 1; } /* Stays visible while pulsing, then relies on overall animation duration */
          }

        `}</style>

        {/* Static Nodes (circles for tokens, rects for DEXes) & Text */}
        {/* Input Token */}
        <circle className="node-circle node-circle-0" cx="30" cy="60" r="15" />
        <text className="node-text node-text-0" x="30" y="60">IN</text>

        {/* DEX 1 */}
        <rect className="dex-box dex-box-0" x="85" y="50" width="50" height="20" rx="3"/>
        <text className="dex-text dex-text-0" x="110" y="60">DEX 1</text>
        
        {/* DEX 2 */}
        <rect className="dex-box dex-box-1" x="175" y="50" width="50" height="20" rx="3"/>
        <text className="dex-text dex-text-1" x="200" y="60">DEX 2</text>
        
        {/* DEX 3 */}
        <rect className="dex-box dex-box-2" x="265" y="50" width="50" height="20" rx="3"/>
        <text className="dex-text dex-text-2" x="290" y="60">DEX 3</text>

        {/* Output Token */}
        <circle className="node-circle node-circle-4" cx="370" cy="60" r="15" />
        <text className="node-text node-text-4" x="370" y="60">OUT</text>

        {/* Connecting Paths (lines that draw) */}
        <line className="connecting-path path-1" x1="45" y1="60" x2="85" y2="60" />
        <line className="connecting-path path-2" x1="135" y1="60" x2="175" y2="60" />
        <line className="connecting-path path-3" x1="225" y1="60" x2="265" y2="60" />
        <line className="connecting-path path-4" x1="315" y1="60" x2="355" y2="60" />

        {/* Pulsing Lines (animated overlay on top of connecting paths) */}
        <line className="pulse-line pulse-1" x1="45" y1="60" x2="85" y2="60" />
        <line className="pulse-line pulse-2" x1="135" y1="60" x2="175" y2="60" />
        <line className="pulse-line pulse-3" x1="225" y1="60" x2="265" y2="60" />
        <line className="pulse-line pulse-4" x1="315" y1="60" x2="355" y2="60" />
      </svg>
    </div>
  );
};

export default PathfindingAnimation;

