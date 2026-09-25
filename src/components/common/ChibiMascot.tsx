import React from 'react';

interface ChibiMascotProps {
  variant?: 'stylist' | 'measuring' | 'fitting' | 'hanger' | 'celebrate';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

export const ChibiMascot: React.FC<ChibiMascotProps> = ({
  variant = 'stylist',
  size = 'md',
  className = '',
  animate = true,
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const animClass = animate ? 'animate-bounce-subtle' : '';

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${sizeMap[size]} ${className} ${animClass}`}
      role="img"
      aria-label={`Rissée Chibi Atelier Mascot - ${variant}`}
    >
      {variant === 'stylist' && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          {/* Soft Glow */}
          <circle cx="50" cy="50" r="46" fill="#FFF8F3" stroke="#F0E3D6" strokeWidth="2" />
          
          {/* Hair back */}
          <path d="M28 42C26 58 30 70 34 76C38 78 44 79 50 79C56 79 62 78 66 76C70 70 74 58 72 42C72 26 62 20 50 20C38 20 28 26 28 42Z" fill="#523A28" />
          
          {/* Dress Body */}
          <path d="M38 58L32 82C32 82 43 85 50 85C57 85 68 82 68 82L62 58L50 56L38 58Z" fill="#E6A8B8" />
          {/* Dress Ribbon */}
          <path d="M42 59C46 61 54 61 58 59C58 63 54 64 50 64C46 64 42 63 42 59Z" fill="#C97A91" />
          <circle cx="50" cy="61" r="2.5" fill="#FFF" />

          {/* Head & Neck */}
          <rect x="46" y="50" width="8" height="8" rx="2" fill="#FDDFCF" />
          <ellipse cx="50" cy="40" rx="19" ry="17" fill="#FEEFE5" stroke="#E6C8B5" strokeWidth="1" />

          {/* Hair Front Bangs */}
          <path d="M32 36C35 27 43 24 50 24C57 24 65 27 68 36C68 36 61 31 53 32C46 33 41 37 32 36Z" fill="#523A28" />
          {/* Hair Bun / Twists */}
          <circle cx="33" cy="26" r="6" fill="#523A28" />
          <circle cx="67" cy="26" r="6" fill="#523A28" />
          {/* Bow on Hair */}
          <path d="M46 22C48 20 52 20 54 22L52 24L48 24L46 22Z" fill="#E6A8B8" />
          <circle cx="50" cy="23" r="2" fill="#D3889D" />

          {/* Cute Chibi Eyes */}
          <ellipse cx="43" cy="40" rx="2.5" ry="3.5" fill="#3D291C" />
          <circle cx="44" cy="39" r="1.2" fill="#FFFFFF" />
          <circle cx="42" cy="42" r="0.6" fill="#FFFFFF" />

          <ellipse cx="57" cy="40" rx="2.5" ry="3.5" fill="#3D291C" />
          <circle cx="58" cy="39" r="1.2" fill="#FFFFFF" />
          <circle cx="56" cy="42" r="0.6" fill="#FFFFFF" />

          {/* Soft Blush */}
          <ellipse cx="38" cy="44" rx="3.5" ry="1.8" fill="#F8B4B4" opacity="0.6" />
          <ellipse cx="62" cy="44" rx="3.5" ry="1.8" fill="#F8B4B4" opacity="0.6" />

          {/* Smiling Lips */}
          <path d="M48 46C49 47.5 51 47.5 52 46" stroke="#C77D6D" strokeWidth="1.2" strokeLinecap="round" />

          {/* Little Arms holding a flower / sparkle */}
          <path d="M36 62C39 65 42 66 45 66" stroke="#FDDFCF" strokeWidth="3" strokeLinecap="round" />
          <path d="M64 62C61 65 58 66 55 66" stroke="#FDDFCF" strokeWidth="3" strokeLinecap="round" />
          
          {/* Golden Sparkle in hand */}
          <path d="M50 64L51.5 68L55.5 69.5L51.5 71L50 75L48.5 71L44.5 69.5L48.5 68L50 64Z" fill="#F6C453" />
        </svg>
      )}

      {variant === 'measuring' && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          <circle cx="50" cy="50" r="46" fill="#F5F9F7" stroke="#E2ECE6" strokeWidth="2" />
          {/* Dress Form Mannequin */}
          <rect x="48" y="68" width="4" height="20" fill="#B39D88" rx="2" />
          <path d="M42 88H58" stroke="#8C7764" strokeWidth="3" strokeLinecap="round" />
          <path d="M40 38C40 38 43 45 46 48C46 54 44 60 38 68H62C56 60 54 54 54 48C57 45 60 38 60 38H40Z" fill="#FBEFE6" stroke="#D7BAA5" strokeWidth="2" />
          
          {/* Measuring Tape wrapped */}
          <path d="M35 52C42 56 58 56 65 52C67 53 66 56 63 57C56 60 44 60 37 57C34 55 34 53 35 52Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
          {/* Tape marks */}
          <line x1="42" y1="53" x2="42" y2="56" stroke="#713F12" strokeWidth="1" />
          <line x1="48" y1="54" x2="48" y2="57" stroke="#713F12" strokeWidth="1" />
          <line x1="54" y1="54" x2="54" y2="57" stroke="#713F12" strokeWidth="1" />
          <line x1="60" y1="53" x2="60" y2="56" stroke="#713F12" strokeWidth="1" />

          {/* Little Chibi Head looking from side */}
          <circle cx="72" cy="35" r="14" fill="#FEEFE5" stroke="#E6C8B5" strokeWidth="1" />
          <path d="M62 30C66 22 76 21 82 28C84 34 83 40 82 42C79 36 71 33 62 30Z" fill="#4B3322" />
          {/* Winking eye */}
          <path d="M71 34C73 36 75 36 77 34" stroke="#3D291C" strokeWidth="1.5" strokeLinecap="round" />
          {/* Blush */}
          <ellipse cx="74" cy="39" rx="3" ry="1.5" fill="#F8B4B4" opacity="0.6" />
          {/* Sparkle */}
          <path d="M26 30L27 34L31 35L27 36L26 40L25 36L21 35L25 34L26 30Z" fill="#EAB308" />
        </svg>
      )}

      {variant === 'fitting' && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          <circle cx="50" cy="50" r="46" fill="#FDF7FA" stroke="#F1E3EB" strokeWidth="2" />
          {/* Full Mirror Frame */}
          <rect x="25" y="16" width="50" height="68" rx="25" fill="#FAF5F0" stroke="#C4A88F" strokeWidth="3" />
          <rect x="30" y="21" width="40" height="58" rx="20" fill="#EBF4F6" stroke="#BED5DB" strokeWidth="1.5" />
          
          {/* Reflection: Vietnamese Ao Dai / Couture Silhouette */}
          <path d="M43 38C46 34 54 34 57 38L61 52L59 72H41L39 52L43 38Z" fill="#F4A7B9" />
          <path d="M50 36V72" stroke="#FFF" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="50" cy="30" r="6" fill="#523A28" />

          {/* Little Stars around mirror */}
          <path d="M78 24L79 27L82 28L79 29L78 32L77 29L74 28L77 27L78 24Z" fill="#D97706" />
          <path d="M20 62L21 64L23 65L21 66L20 68L19 66L17 65L19 64L20 62Z" fill="#EC4899" />
        </svg>
      )}

      {variant === 'hanger' && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          <circle cx="50" cy="50" r="46" fill="#FFFDF8" stroke="#F0E8D5" strokeWidth="2" />
          {/* Golden Hanger */}
          <path d="M50 24C47 24 45 26 45 29C45 32 48 34 50 34C50 37 50 40 50 40L28 54C26 55 26 58 29 58H71C74 58 74 55 72 54L50 40V34" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Dress hanging */}
          <path d="M38 58L32 80C32 80 43 83 50 83C57 83 68 80 68 80L62 58L50 56L38 58Z" fill="#E8B4C0" />
          <path d="M44 64C48 66 52 66 56 64" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" />
          {/* Sparkle */}
          <path d="M50 20L51 22L53 23L51 24L50 26L49 24L47 23L49 22L50 20Z" fill="#D4AF37" />
        </svg>
      )}

      {variant === 'celebrate' && (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          <circle cx="50" cy="50" r="46" fill="#FFF8F5" stroke="#F5DFD6" strokeWidth="2" />
          {/* Happy dancing mascot */}
          <path d="M30 46C28 62 32 74 36 78C40 80 46 81 50 81C54 81 60 80 64 78C68 74 72 62 70 46C70 30 60 24 50 24C40 24 30 30 30 46Z" fill="#4A3423" />
          {/* Dancing twirling dress */}
          <path d="M36 56L26 78C32 84 68 84 74 78L64 56L50 54L36 56Z" fill="#E599AC" />
          <circle cx="50" cy="40" rx="18" ry="16" fill="#FEEFE5" stroke="#E6C8B5" strokeWidth="1" />
          <path d="M34 38C38 30 44 28 50 28C56 28 62 30 66 38C66 38 60 33 53 34C46 35 41 39 34 38Z" fill="#4A3423" />
          {/* Happy closed curve eyes */}
          <path d="M42 41C43.5 39 45.5 39 47 41" stroke="#3D291C" strokeWidth="2" strokeLinecap="round" />
          <path d="M53 41C54.5 39 56.5 39 58 41" stroke="#3D291C" strokeWidth="2" strokeLinecap="round" />
          {/* Big happy mouth */}
          <path d="M46 45C47.5 48.5 52.5 48.5 54 45" stroke="#C77D6D" strokeWidth="1.5" strokeLinecap="round" fill="#F48FB1" />
          {/* Rosy cheeks */}
          <ellipse cx="39" cy="44" rx="3.5" ry="2" fill="#F8B4B4" opacity="0.8" />
          <ellipse cx="61" cy="44" rx="3.5" ry="2" fill="#F8B4B4" opacity="0.8" />
          {/* Confetti */}
          <circle cx="24" cy="28" r="2" fill="#F472B6" />
          <circle cx="76" cy="28" r="2.5" fill="#FBBF24" />
          <circle cx="78" cy="62" r="2" fill="#34D399" />
          <circle cx="22" cy="60" r="2" fill="#60A5FA" />
        </svg>
      )}
    </div>
  );
};
