import React from 'react';

interface ChibiDecorationProps {
  variant?: 'rose-gown' | 'emerald-gown' | 'pearl-mini';
  position?: 'top-right' | 'bottom-left' | 'hero-corner' | 'bottom-right';
  className?: string;
}

export const ChibiDecoration: React.FC<ChibiDecorationProps> = ({
  variant = 'rose-gown',
  position,
  className = '',
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'fixed top-24 right-6 sm:right-12 z-0 hidden md:block';
      case 'bottom-left':
        return 'fixed bottom-12 left-6 sm:left-12 z-0 hidden md:block';
      case 'bottom-right':
        return 'fixed bottom-12 right-6 sm:right-12 z-0 hidden md:block';
      case 'hero-corner':
        return 'absolute -top-8 -right-8 z-10 hidden sm:block';
      default:
        return 'relative';
    }
  };

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className={`pointer-events-none select-none transition-opacity duration-300 opacity-70 hover:opacity-100 dark:opacity-50 dark:hover:opacity-80 motion-safe:animate-subtle-float ${getPositionClasses()} ${className}`}
    >
      {variant === 'rose-gown' && (
        <svg
          width="110"
          height="140"
          viewBox="0 0 110 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          {/* Sparkle stars */}
          <path
            d="M92 24L94 18L96 24L102 26L96 28L94 34L92 28L86 26L92 24Z"
            fill="#dfc8b4"
            className="animate-pulse"
          />
          <path
            d="M18 50L19.5 45L21 50L26 51.5L21 53L19.5 58L18 53L13 51.5L18 50Z"
            fill="#e2b9ba"
            className="animate-pulse"
          />

          {/* Hair back */}
          <path
            d="M32 46C26 56 24 74 34 88C36 78 40 68 40 60C38 52 35 48 32 46Z"
            fill="#3e2e28"
          />
          <path
            d="M78 46C84 56 86 74 76 88C74 78 70 68 70 60C72 52 75 48 78 46Z"
            fill="#3e2e28"
          />

          {/* Draped Rose Vietnamese Dress Skirt */}
          <path
            d="M44 82C40 94 34 115 30 132C37 135 73 135 80 132C76 115 70 94 66 82L44 82Z"
            fill="#f3d7d7"
          />
          {/* Dress folds & layers */}
          <path
            d="M42 90C48 102 54 116 52 133C56 134 64 134 68 132C66 118 64 102 68 86"
            stroke="#e4b5b7"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M48 82C52 92 56 110 58 133"
            stroke="#edd0d2"
            strokeWidth="1.5"
          />
          {/* Waist Corset / Sash */}
          <rect x="44" y="80" width="22" height="7" rx="3.5" fill="#df989b" />
          <path
            d="M55 87L52 99M55 87L58 99"
            stroke="#df989b"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Bodice */}
          <path
            d="M45 68C42 74 44 80 44 82C50 84 60 84 66 82C66 80 68 74 65 68C61 71 49 71 45 68Z"
            fill="#f9e8e8"
          />
          {/* Off-shoulder draped sleeve frills */}
          <path
            d="M38 70C36 74 38 78 42 77C44 73 43 69 40 68C39 68 38 69 38 70Z"
            fill="#f3d7d7"
          />
          <path
            d="M72 70C74 74 72 78 68 77C66 73 67 69 70 68C71 68 72 69 72 70Z"
            fill="#f3d7d7"
          />

          {/* Dainty Chibi Arms */}
          <path
            d="M42 74C38 82 39 88 44 91"
            stroke="#fad5c3"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M68 74C72 82 71 88 66 91"
            stroke="#fad5c3"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Tiny flower in hands */}
          <circle cx="55" cy="91" r="3" fill="#e2a1a4" />
          <circle cx="55" cy="91" r="1.2" fill="#fff" />

          {/* Neck */}
          <rect x="52" y="60" width="6" height="8" rx="3" fill="#fad5c3" />

          {/* Head */}
          <ellipse cx="55" cy="46" rx="22" ry="20" fill="#fdebe2" />

          {/* Cheeks blush */}
          <ellipse cx="40" cy="52" rx="3.5" ry="2" fill="#f8b6b9" opacity="0.8" />
          <ellipse cx="70" cy="52" rx="3.5" ry="2" fill="#f8b6b9" opacity="0.8" />

          {/* Eyes (Cute anime/chibi open smiling eyes) */}
          <ellipse cx="44" cy="46" rx="3" ry="4" fill="#3a2723" />
          <circle cx="43" cy="44.5" r="1.2" fill="#ffffff" />
          <circle cx="45" cy="47.5" r="0.6" fill="#ffffff" />

          <ellipse cx="66" cy="46" rx="3" ry="4" fill="#3a2723" />
          <circle cx="65" cy="44.5" r="1.2" fill="#ffffff" />
          <circle cx="67" cy="47.5" r="0.6" fill="#ffffff" />

          {/* Cute subtle smile */}
          <path
            d="M52 52C53.5 54 56.5 54 58 52"
            stroke="#c87f7a"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Front Hair Bangs */}
          <path
            d="M33 42C33 30 43 24 55 24C67 24 77 30 77 42C72 38 66 38 60 41C55 36 45 37 40 42C37 42 34 42 33 42Z"
            fill="#4a362f"
          />
          <path
            d="M48 24C44 28 42 35 41 40"
            stroke="#5d453c"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M62 24C66 28 68 35 69 40"
            stroke="#5d453c"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Lotus / Jasmine Flower Hairclip */}
          <circle cx="70" cy="32" r="4.5" fill="#ffffff" />
          <circle cx="73" cy="29" r="3" fill="#f9d7d9" />
          <circle cx="68" cy="28" r="3" fill="#f9d7d9" />
          <circle cx="70" cy="32" r="2" fill="#dfa25d" />

          {/* Little feet shoes */}
          <ellipse cx="48" cy="133" rx="3.5" ry="2" fill="#d99ca0" />
          <ellipse cx="62" cy="133" rx="3.5" ry="2" fill="#d99ca0" />
        </svg>
      )}

      {variant === 'emerald-gown' && (
        <svg
          width="110"
          height="140"
          viewBox="0 0 110 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          {/* Sparkles */}
          <path
            d="M20 28L21.5 23L23 28L28 29.5L23 31L21.5 36L20 31L15 29.5L20 28Z"
            fill="#9ccbb6"
            className="animate-pulse"
          />

          {/* Hair Bun / Elegant updo */}
          <ellipse cx="55" cy="22" rx="14" ry="11" fill="#2d221e" />
          <ellipse cx="55" cy="46" rx="23" ry="21" fill="#fdebe2" />

          {/* Side hair locks */}
          <path
            d="M34 42C32 54 34 68 36 74C37 66 38 56 38 48"
            stroke="#3b2b25"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M76 42C78 54 76 68 74 74C73 66 72 56 72 48"
            stroke="#3b2b25"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Emerald Gown Skirt */}
          <path
            d="M45 82C40 95 32 118 28 133C38 136 72 136 82 133C78 118 70 95 65 82L45 82Z"
            fill="#2c5b48"
          />
          {/* Gold embroidery accents */}
          <path
            d="M40 128C48 124 62 124 70 128"
            stroke="#d4af37"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M44 122C50 119 60 119 66 122"
            stroke="#e5c866"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Champagne Silk Sash */}
          <rect x="44" y="80" width="22" height="6" rx="3" fill="#e8d5b5" />
          <path
            d="M52 86C50 94 48 102 46 110M52 86C54 94 56 102 58 110"
            stroke="#e8d5b5"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Bodice */}
          <path
            d="M45 68C43 74 44 80 44 82C51 84 59 84 66 82C66 80 67 74 65 68Z"
            fill="#386f58"
          />

          {/* Arms holding a tiny boutique hanger */}
          <path
            d="M43 74C39 80 42 86 48 88"
            stroke="#fad5c3"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M67 74C71 80 68 86 62 88"
            stroke="#fad5c3"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Mini Gold Hanger */}
          <path
            d="M52 86L55 83L58 86M55 83V80C55 79 57 79 57 80"
            stroke="#d4af37"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Neck */}
          <rect x="52" y="60" width="6" height="8" rx="3" fill="#fad5c3" />

          {/* Cheeks */}
          <ellipse cx="41" cy="53" rx="3" ry="1.8" fill="#f8b6b9" opacity="0.8" />
          <ellipse cx="69" cy="53" rx="3" ry="1.8" fill="#f8b6b9" opacity="0.8" />

          {/* Winking cute eyes */}
          <path
            d="M41 46C43 44 46 44 48 46"
            stroke="#3a2723"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <ellipse cx="65" cy="46" rx="3" ry="3.8" fill="#3a2723" />
          <circle cx="64" cy="44.5" r="1.2" fill="#ffffff" />

          {/* Happy smile */}
          <path
            d="M52 53C53.5 55 56.5 55 58 53"
            stroke="#c87f7a"
            strokeWidth="1.3"
            strokeLinecap="round"
          />

          {/* Hair bangs */}
          <path
            d="M34 40C38 32 46 28 55 28C64 28 72 32 76 40C70 36 63 36 58 39C53 35 44 35 39 40"
            fill="#3b2b25"
          />

          {/* Emerald Tiara / Hairpin */}
          <path
            d="M50 24L55 20L60 24"
            stroke="#d4af37"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="55" cy="20" r="1.8" fill="#4ade80" />

          {/* Gold Shoes */}
          <ellipse cx="48" cy="133" rx="3.5" ry="2" fill="#d4af37" />
          <ellipse cx="62" cy="133" rx="3.5" ry="2" fill="#d4af37" />
        </svg>
      )}

      {variant === 'pearl-mini' && (
        <svg
          width="100"
          height="130"
          viewBox="0 0 100 130"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          {/* Sparkles */}
          <path
            d="M80 18L81.5 13L83 18L88 19.5L83 21L81.5 26L80 21L75 19.5L80 18Z"
            fill="#f5e1a4"
            className="animate-pulse"
          />

          {/* Chibi Head */}
          <ellipse cx="50" cy="42" rx="20" ry="18" fill="#fdebe2" />

          {/* Pearl White Dress Skirt */}
          <path
            d="M40 76C36 86 32 102 28 116C36 118 64 118 72 116C68 102 64 86 60 76L40 76Z"
            fill="#fdfbf7"
          />
          {/* Subtle pleats */}
          <path
            d="M44 80L42 115M50 78L50 116M56 80L58 115"
            stroke="#eee7db"
            strokeWidth="1.2"
          />

          {/* Bodice with Pearl Trim */}
          <path
            d="M41 62C38 67 40 74 40 76C47 78 53 78 60 76C60 74 62 67 59 62Z"
            fill="#fff9f0"
          />
          {/* Tiny pearls on neckline */}
          <circle cx="44" cy="64" r="1.2" fill="#f8eed8" stroke="#d5c7ab" strokeWidth="0.5" />
          <circle cx="48" cy="65" r="1.2" fill="#f8eed8" stroke="#d5c7ab" strokeWidth="0.5" />
          <circle cx="52" cy="65" r="1.2" fill="#f8eed8" stroke="#d5c7ab" strokeWidth="0.5" />
          <circle cx="56" cy="64" r="1.2" fill="#f8eed8" stroke="#d5c7ab" strokeWidth="0.5" />

          {/* Neck */}
          <rect x="47" y="55" width="6" height="7" rx="3" fill="#fad5c3" />

          {/* Arms holding measuring tape */}
          <path
            d="M38 68C34 74 36 80 42 82"
            stroke="#fad5c3"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M62 68C66 74 64 80 58 82"
            stroke="#fad5c3"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Measuring tape ribbon */}
          <path
            d="M40 82C46 84 54 84 60 82"
            stroke="#f59e0b"
            strokeWidth="1.8"
            strokeDasharray="2 1.5"
            strokeLinecap="round"
          />

          {/* Cheeks */}
          <ellipse cx="37" cy="48" rx="3" ry="1.8" fill="#f8b6b9" opacity="0.8" />
          <ellipse cx="63" cy="48" rx="3" ry="1.8" fill="#f8b6b9" opacity="0.8" />

          {/* Eyes with sparkle */}
          <ellipse cx="40" cy="42" rx="2.8" ry="3.5" fill="#3a2723" />
          <circle cx="39" cy="40.8" r="1" fill="#ffffff" />
          <ellipse cx="60" cy="42" rx="2.8" ry="3.5" fill="#3a2723" />
          <circle cx="59" cy="40.8" r="1" fill="#ffffff" />

          {/* Cute smile */}
          <path
            d="M47 48C48.5 50 51.5 50 53 48"
            stroke="#c87f7a"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Twin side ponytails with ribbons */}
          <path
            d="M32 36C26 42 22 52 24 60C26 54 30 48 34 44"
            fill="#4a342c"
          />
          <path
            d="M68 36C74 42 78 52 76 60C74 54 70 48 66 44"
            fill="#4a342c"
          />
          {/* Hair Ribbon Ties */}
          <circle cx="31" cy="40" r="3" fill="#dfc8b4" />
          <circle cx="69" cy="40" r="3" fill="#dfc8b4" />

          {/* Hair Front */}
          <path
            d="M32 38C35 28 42 24 50 24C58 24 65 28 68 38C62 34 56 34 52 37C48 33 40 33 35 38"
            fill="#4a342c"
          />

          {/* Shoes */}
          <ellipse cx="44" cy="116" rx="3" ry="1.8" fill="#dfc8b4" />
          <ellipse cx="56" cy="116" rx="3" ry="1.8" fill="#dfc8b4" />
        </svg>
      )}
    </div>
  );
};
