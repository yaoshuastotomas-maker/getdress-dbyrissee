import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';
import { AnnouncementBanner } from '../common/AnnouncementBanner';
import { PWAInstallPrompt } from '../common/PWAInstallPrompt';
import { WebsiteSettings } from '../../types';
import { api } from '../../services/api';

export const CustomerLayout: React.FC = () => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  useEffect(() => {
    let isMounted = true;
    api.settings
      .get()
      .then((data) => {
        if (isMounted) setSettings(data);
      })
      .catch((err) => {
        console.error('Failed to load website settings:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#1c1917] dark:bg-stone-950 dark:text-stone-100 transition-colors duration-200">
      {/* Announcement Banner if active */}
      {settings?.announcement_enabled && (
        <AnnouncementBanner
          text={settings.announcement}
          enabled={settings.announcement_enabled}
        />
      )}

      {/* Main Header */}
      <Header settings={settings} />

      {/* Page View */}
      <main className="flex-grow">
        <Outlet context={{ settings }} />
      </main>

      {/* Boutique Footer */}
      <Footer settings={settings} />

      {/* PWA / iOS Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};
