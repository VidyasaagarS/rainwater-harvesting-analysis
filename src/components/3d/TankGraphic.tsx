import React from 'react';

interface TankGraphicProps {
  percentage: number;
  currentStorage: number;
  capacity: number;
  remaining: number;
}

export const TankGraphic: React.FC<TankGraphicProps> = ({
  percentage,
  currentStorage,
  capacity,
  remaining,
}) => {
  // Bound percentage 0 - 100
  const pct = Math.min(100, Math.max(0, percentage));
  
  // Calculate water height in pixels within the SVG cylinder
  // Cylinder height is 140px (from top y=25 to bottom y=165)
  const maxWaterH = 135;
  const waterH = (pct / 100) * maxWaterH;
  const waterY = 165 - waterH;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 p-2">
      {/* 3D Glass Cylinder SVG Visualization */}
      <div className="relative w-36 h-48 flex items-center justify-center filter drop-shadow-md">
        <svg viewBox="0 0 140 190" className="w-full h-full overflow-visible">
          <defs>
            {/* Glass body gradient */}
            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="20%" stopColor="#e2e8f0" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="80%" stopColor="#cbd5e1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.7" />
            </linearGradient>

            {/* Water body gradient */}
            <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="40%" stopColor="#0284c7" />
              <stop offset="80%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#075985" />
            </linearGradient>

            {/* Water surface top ellipse gradient */}
            <linearGradient id="waterTopGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Glass Cap Gradient */}
            <linearGradient id="capGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Tank Outer Base Shadow */}
          <ellipse cx="70" cy="172" rx="52" ry="12" fill="#cbd5e1" opacity="0.6" filter="url(#shadow)" />

          {/* Tank Back Wall */}
          <path d="M 18 28 L 18 165 A 52 14 0 0 0 122 165 L 122 28 Z" fill="#e2e8f0" opacity="0.3" />

          {/* WATER VOLUME (Fill level) */}
          {pct > 0 && (
            <g>
              {/* Main Water Body Fill */}
              <path
                d={`M 18 ${waterY} L 18 165 A 52 14 0 0 0 122 165 L 122 ${waterY} A 52 14 0 0 1 18 ${waterY} Z`}
                fill="url(#waterGrad)"
                className="transition-all duration-700 ease-out"
              />
              
              {/* Bottom Water Curved Base */}
              <ellipse cx="70" cy="165" rx="52" ry="14" fill="#0369a1" opacity="0.8" />

              {/* Water Surface Top Oval */}
              <ellipse
                cx="70"
                cy={waterY}
                rx="52"
                ry="14"
                fill="url(#waterTopGrad)"
                className="transition-all duration-700 ease-out"
                stroke="#bae6fd"
                strokeWidth="1.5"
              />

              {/* Water Ripple effect overlay */}
              <ellipse
                cx="70"
                cy={waterY}
                rx="35"
                ry="9"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1"
                opacity="0.5"
              />
            </g>
          )}

          {/* Tank Front Glass Cylinder Shell */}
          <path
            d="M 18 28 L 18 165 A 52 14 0 0 0 122 165 L 122 28 A 52 14 0 0 0 18 28 Z"
            fill="url(#glassGrad)"
            stroke="#94a3b8"
            strokeWidth="2.5"
          />

          {/* Glass Highlights (Reflex lines) */}
          <path d="M 28 35 L 28 158" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
          <path d="M 36 35 L 36 155" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          <path d="M 112 35 L 112 155" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.3" />

          {/* Top Cap Ring */}
          <ellipse cx="70" cy="28" rx="52" ry="14" fill="url(#capGrad)" stroke="#64748b" strokeWidth="2" />
          <ellipse cx="70" cy="28" rx="42" ry="10" fill="none" stroke="#94a3b8" strokeWidth="1" />
          
          {/* Top Inlet Lid */}
          <ellipse cx="70" cy="24" rx="20" ry="6" fill="#475569" stroke="#334155" strokeWidth="1.5" />

          {/* Percentage badge overlay in center of water */}
          <text
            x="70"
            y={waterY < 90 ? waterY + 30 : 100}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="18"
            fontWeight="bold"
            className="drop-shadow-md select-none pointer-events-none"
          >
            {pct}%
          </text>
        </svg>
      </div>

      {/* Side Storage Details (Matches Reference Screenshot perfectly) */}
      <div className="flex flex-col gap-4 text-left justify-center min-w-[150px]">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Storage</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-0.5 flex items-baseline gap-1.5">
            {currentStorage.toLocaleString()} L
            <span className="text-sm font-semibold text-blue-600">({pct}%)</span>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tank Capacity</div>
          <div className="text-lg font-bold text-slate-800 mt-0.5">
            {capacity.toLocaleString()} L
          </div>
        </div>

        <div className="border-t border-slate-100 pt-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Remaining Capacity</div>
          <div className="text-lg font-bold text-slate-800 mt-0.5">
            {remaining.toLocaleString()} L
          </div>
        </div>
      </div>
    </div>
  );
};
