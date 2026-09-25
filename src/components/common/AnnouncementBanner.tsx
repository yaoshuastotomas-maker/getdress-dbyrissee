import React from 'react';
import { Sparkles } from 'lucide-react';

interface AnnouncementBannerProps {
  text: string;
  enabled: boolean;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ text, enabled }) => {
  if (!enabled || !text) return null;

  return (
    <div className="bg-[#1c1917] text-[#f5efe6] py-2.5 px-4 text-xs tracking-wider uppercase font-medium text-center border-b border-stone-800 flex items-center justify-center gap-2">
      <Sparkles className="w-3.5 h-3.5 text-[#dfc8b4] shrink-0" />
      <span className="truncate">{text}</span>
      <Sparkles className="w-3.5 h-3.5 text-[#dfc8b4] shrink-0" />
    </div>
  );
};
