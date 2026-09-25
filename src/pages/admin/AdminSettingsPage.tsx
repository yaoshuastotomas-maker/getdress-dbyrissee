import React, { useEffect, useState } from 'react';
import {
  Save,
  Lock,
  Sliders,
  Globe,
  Phone,
  Mail,
  MapPin,
  Eye,
  Sparkles,
  CreditCard,
  Plus,
  Trash2,
  Smartphone,
  Banknote,
  Building2,
  AlertCircle,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Apple,
  Cloud,
  Server,
  Zap,
  Download,
  Loader2,
  Key
} from 'lucide-react';
import { WebsiteSettings, PaymentSettings, BankAccount } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

export const AdminSettingsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const { theme, actualTheme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Production Domain, Netlify & App Store
  const [customDomain, setCustomDomain] = useState('getdressdbyrissee.ph');
  const [netlifyUrl, setNetlifyUrl] = useState('https://getdressdbyrissee.netlify.app');
  const [appStoreUrl, setAppStoreUrl] = useState('');
  const [netlifyToken, setNetlifyToken] = useState('');
  const [isDeployingNetlify, setIsDeployingNetlify] = useState(false);
  const [deploySuccessMessage, setDeploySuccessMessage] = useState<string | null>(null);

  // General Boutique Settings
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [hoursMonFri, setHoursMonFri] = useState('');
  const [hoursSat, setHoursSat] = useState('');
  const [hoursSun, setHoursSun] = useState('');

  // Announcement Banner
  const [announcement, setAnnouncement] = useState('');
  const [announcementEnabled, setAnnouncementEnabled] = useState(false);

  // Homepage Hero
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');

  // Homepage About
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [aboutImageUrl, setAboutImageUrl] = useState('');

  // Chibi Decorations
  const [chibiDecorations, setChibiDecorations] = useState(true);

  // Section Toggles
  const [sectionsConfig, setSectionsConfig] = useState<WebsiteSettings['sections_config']>({
    hero: true,
    announcement: true,
    featured: true,
    about: true,
    categories: true,
    services: true,
    payment: true,
    contact: true,
  });

  // Payment Settings
  const [cashEnabled, setCashEnabled] = useState(true);
  const [cashInstructions, setCashInstructions] = useState('');

  const [gcashEnabled, setGcashEnabled] = useState(true);
  const [gcashAccountName, setGcashAccountName] = useState('Rissée R.');
  const [gcashAccountNumber, setGcashAccountNumber] = useState('0917 839 2841');
  const [gcashInstructions, setGcashInstructions] = useState('');
  const [gcashQrCodeUrl, setGcashQrCodeUrl] = useState('');

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: 'bdo-1',
      bank_name: 'BDO Unibank',
      account_name: 'Rissée Couture Boutique',
      account_number: '0012 3456 7890',
      instructions: 'Online transfer or over-the-counter deposit.',
    },
    {
      id: 'bpi-1',
      bank_name: 'Bank of the Philippine Islands (BPI)',
      account_name: 'Rissée Couture Boutique',
      account_number: '1234 5678 90',
      instructions: 'InstaPay or PESONet transfer supported.',
    },
  ]);

  const [paymentDisclaimer, setPaymentDisclaimer] = useState(
    'Payment confirmation may be required before your reservation is finalized.'
  );

  // Password Update
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.settings
      .get()
      .then((data) => {
        if (!isMounted) return;
        setBusinessName(data.business_name || "Get Dress'd by Rissée");
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setAddress(data.address || '');
        setHoursMonFri(data.business_hours?.mon_fri || '');
        setHoursSat(data.business_hours?.sat || '');
        setHoursSun(data.business_hours?.sun || '');
        setAnnouncement(data.announcement || '');
        setAnnouncementEnabled(data.announcement_enabled || false);
        setHeroTitle(data.hero_title || '');
        setHeroSubtitle(data.hero_subtitle || '');
        setHeroImageUrl(data.hero_image_url || '');
        setAboutTitle(data.about_title || '');
        setAboutText(data.about_text || '');
        setAboutImageUrl(data.about_image_url || '');
        setChibiDecorations(data.chibi_decorations !== undefined ? data.chibi_decorations : true);
        setCustomDomain(data.custom_domain || 'getdressdbyrissee.ph');
        setNetlifyUrl(data.netlify_url || 'https://getdressdbyrissee.netlify.app');
        setAppStoreUrl(data.app_store_url || '');

        if (data.sections_config) {
          setSectionsConfig(data.sections_config);
        }

        if (data.payment) {
          setCashEnabled(data.payment.cash?.enabled ?? true);
          setCashInstructions(
            data.payment.cash?.instructions ||
              'Cash payment is accepted upon in-person studio fitting or garment pick-up arrangement.'
          );

          setGcashEnabled(data.payment.gcash?.enabled ?? true);
          setGcashAccountName(data.payment.gcash?.account_name || 'Rissée R.');
          setGcashAccountNumber(data.payment.gcash?.account_number || '0917 839 2841');
          setGcashInstructions(
            data.payment.gcash?.instructions ||
              'Send payment via GCash Express Send. Please save your reference number or screenshot to confirm your reservation.'
          );
          setGcashQrCodeUrl(data.payment.gcash?.qr_code_url || '');

          if (Array.isArray(data.payment.banks) && data.payment.banks.length > 0) {
            setBankAccounts(data.payment.banks);
          }

          if (data.payment.disclaimer) {
            setPaymentDisclaimer(data.payment.disclaimer);
          }
        }

        setLoading(false);
      })
      .catch((err) => {
        toastError('Failed to load settings: ' + err.message);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddBank = () => {
    const newBank: BankAccount = {
      id: 'bank-' + Date.now(),
      bank_name: 'UnionBank of the Philippines',
      account_name: 'Rissée Couture Boutique',
      account_number: '1098 7654 3210',
      instructions: 'InstaPay 24/7 instant transfer',
    };
    setBankAccounts([...bankAccounts, newBank]);
  };

  const handleUpdateBank = (id: string, field: keyof BankAccount, val: string) => {
    setBankAccounts(
      bankAccounts.map((b) => (b.id === id ? { ...b, [field]: val } : b))
    );
  };

  const handleRemoveBank = (id: string) => {
    setBankAccounts(bankAccounts.filter((b) => b.id !== id));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const paymentPayload: PaymentSettings = {
      cash: {
        enabled: cashEnabled,
        instructions: cashInstructions,
      },
      gcash: {
        enabled: gcashEnabled,
        account_name: gcashAccountName.trim(),
        account_number: gcashAccountNumber.trim(),
        instructions: gcashInstructions,
        qr_code_url: gcashQrCodeUrl.trim(),
      },
      banks: bankAccounts,
      disclaimer: paymentDisclaimer.trim(),
    };

    const payload: Partial<WebsiteSettings> = {
      business_name: businessName,
      phone,
      email,
      address,
      business_hours: {
        mon_fri: hoursMonFri,
        sat: hoursSat,
        sun: hoursSun,
      },
      announcement,
      announcement_enabled: announcementEnabled,
      hero_title: heroTitle,
      hero_subtitle: heroSubtitle,
      hero_image_url: heroImageUrl,
      about_title: aboutTitle,
      about_text: aboutText,
      about_image_url: aboutImageUrl,
      chibi_decorations: chibiDecorations,
      sections_config: sectionsConfig,
      payment: paymentPayload,
      custom_domain: customDomain.trim(),
      netlify_url: netlifyUrl.trim(),
      app_store_url: appStoreUrl.trim(),
    };

    try {
      await api.settings.update(payload);
      success('Website settings updated successfully! Live boutique refreshed.');
    } catch (err: any) {
      toastError(err.message || 'Failed to update website settings');
    } finally {
      setSaving(false);
    }
  };

  const handleDeployToNetlify = async () => {
    if (!netlifyToken.trim()) {
      toastError('Please enter your Netlify Personal Access Token to trigger automated deployment.');
      return;
    }
    setIsDeployingNetlify(true);
    setDeploySuccessMessage(null);
    try {
      const res = await api.netlify.deploy(netlifyToken.trim(), 'getdressdbyrissee');
      if (res.success && res.url) {
        setNetlifyUrl(res.url);
        setDeploySuccessMessage(`Live now at ${res.url}`);
        success(`Website deployed successfully to ${res.url}!`);
      }
    } catch (err: any) {
      toastError(err.message || 'Deployment to Netlify failed. Please verify your token.');
    } finally {
      setIsDeployingNetlify(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toastError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError('Passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await api.auth.updatePassword(newPassword);
      success('Owner login password changed successfully.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toastError(err.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-stone-200 dark:bg-stone-800 w-1/4 rounded-xl" />
        <div className="h-96 bg-stone-200 dark:bg-stone-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-stone-900 dark:text-stone-100">
            Website & Boutique Settings
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Customize boutique branding, Philippine payment methods, chibi decorations, and atelier hours.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
          id="top-save-settings-btn"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-white shadow transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8" id="admin-settings-form">
        
        {/* 0. THEME & DISPLAY APPEARANCE */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-4 shadow-xs">
          <div className="border-b border-stone-100 dark:border-stone-800 pb-3">
            <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 font-medium">
              Theme & Workspace Appearance
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Select your preferred color scheme across both customer-facing boutique and owner dashboard. Currently active: <span className="font-semibold uppercase text-stone-800 dark:text-stone-200">{actualTheme}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <button
              type="button"
              onClick={() => {
                setTheme('light');
                success('Light mode enabled.');
              }}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 ${
                theme === 'light'
                  ? 'border-stone-900 bg-stone-50 dark:bg-stone-800/80 ring-2 ring-stone-900 dark:ring-stone-100 text-stone-900 dark:text-stone-100'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 text-stone-600 dark:text-stone-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <Sun className="w-5 h-5 text-amber-500" />
                {theme === 'light' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-900 text-white dark:bg-white dark:text-stone-900 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Light Palette</p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">Warm ivory, delicate rose gold</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('dark');
                success('Dark mode enabled.');
              }}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 ${
                theme === 'dark'
                  ? 'border-stone-900 bg-stone-50 dark:bg-stone-800/80 ring-2 ring-stone-900 dark:ring-stone-100 text-stone-900 dark:text-stone-100'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 text-stone-600 dark:text-stone-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <Moon className="w-5 h-5 text-indigo-400" />
                {theme === 'dark' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-900 text-white dark:bg-white dark:text-stone-900 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Dark Palette</p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">Obsidian couture, golden accents</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('system');
                success('System color scheme preference applied.');
              }}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-28 ${
                theme === 'system'
                  ? 'border-stone-900 bg-stone-50 dark:bg-stone-800/80 ring-2 ring-stone-900 dark:ring-stone-100 text-stone-900 dark:text-stone-100'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 text-stone-600 dark:text-stone-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <Monitor className="w-5 h-5 text-stone-500" />
                {theme === 'system' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-900 text-white dark:bg-white dark:text-stone-900 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">Auto / System</p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">Syncs with device mode</p>
              </div>
            </button>
          </div>
        </div>

        {/* PRODUCTION, CUSTOM DOMAIN & APPLE APP STORE HUB */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-6 shadow-xs">
          <div className="border-b border-stone-100 dark:border-stone-800 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Production Ready • iOS & Web Architecture</span>
              </div>
              <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 font-medium">
                Custom Domain & Apple App Store Deployment
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Manage your public domain, DNS records, and Apple App Store live-synchronization settings.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>SSL / TLS Encrypted</span>
              </span>
            </div>
          </div>

          {/* 0. Netlify Free Hosting & *.netlify.app Domain */}
          <div className="space-y-4 rounded-2xl border border-teal-500/30 bg-teal-500/5 dark:bg-teal-950/20 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-medium text-sm">
                <Cloud className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Free Hosting &amp; Domain via Netlify (*.netlify.app)</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wider">
                <Zap className="w-3 h-3" />
                <span>Zero-Cost Tier Active</span>
              </span>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400">
              Your boutique is pre-packaged for free global CDN hosting and free domain assignment on Netlify. Client data persists seamlessly via smart local synchronization with zero server maintenance required.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Assigned Netlify Domain URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={netlifyUrl}
                    onChange={(e) => setNetlifyUrl(e.target.value)}
                    placeholder="https://getdressdbyrissee.netlify.app"
                    className="w-full pl-3.5 pr-24 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono text-xs"
                  />
                  <div className="absolute inset-y-0 right-1.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(netlifyUrl);
                        setCopiedKey('netlify_url');
                        setTimeout(() => setCopiedKey(null), 2000);
                      }}
                      className="px-2 py-1 text-xs rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
                    >
                      {copiedKey === 'netlify_url' ? 'Copied!' : 'Copy'}
                    </button>
                    <a
                      href={netlifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                      title="Open Netlify Site"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  Default: <span className="font-mono text-teal-600 dark:text-teal-400">getdressdbyrissee.netlify.app</span>. You can customize this anytime in your Netlify dashboard.
                </p>
              </div>

              <div className="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-stone-800 dark:text-stone-200">
                  <span>Netlify Build Config</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Pre-Configured</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 dark:text-stone-400">
                  <div>
                    <span className="block text-stone-400 uppercase text-[9px]">Build Command:</span>
                    <code className="text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">npm run build:client</code>
                  </div>
                  <div>
                    <span className="block text-stone-400 uppercase text-[9px]">Publish Directory:</span>
                    <code className="text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">dist</code>
                  </div>
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800 pt-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Includes <code className="font-mono">netlify.toml</code> and <code className="font-mono">public/_redirects</code> for seamless SPA routing.</span>
                </div>
              </div>
            </div>

            {/* Automated Netlify Deployment & Instant Zip */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Option A: Direct Automated Deploy via Token */}
              <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-teal-500/30 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Option A: Automated Direct Deploy</span>
                    </span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider bg-teal-500/10 px-2 py-0.5 rounded-full">
                      Fastest
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Paste your free Netlify Personal Access Token (get one in 20s from{' '}
                    <a
                      href="https://app.netlify.com/user/applications#personal-access-tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-teal-600 dark:text-teal-400"
                    >
                      User &rarr; Applications
                    </a>
                    ).
                  </p>
                  <div className="mt-2.5">
                    <input
                      type="password"
                      value={netlifyToken}
                      onChange={(e) => setNetlifyToken(e.target.value)}
                      placeholder="nfp_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50 text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isDeployingNetlify || !netlifyToken.trim()}
                    onClick={handleDeployToNetlify}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-medium transition-all shadow-xs"
                  >
                    {isDeployingNetlify ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Deploying to Netlify...</span>
                      </>
                    ) : (
                      <>
                        <Cloud className="w-4 h-4" />
                        <span>Deploy to Netlify Live</span>
                      </>
                    )}
                  </button>
                  {deploySuccessMessage && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium text-center mt-2 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{deploySuccessMessage}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Option B: Netlify Drop Zero-Setup */}
              <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
                      <span>Option B: 1-Click Netlify Drop (No Token)</span>
                    </span>
                    <span className="text-[10px] text-stone-600 dark:text-stone-400 font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">
                      Zero Code
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                    Download the pre-compiled, optimized production bundle (HTML, JS, CSS, PWA, Assets) and drop it into{' '}
                    <a
                      href="https://app.netlify.com/drop"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-teal-600 dark:text-teal-400 font-medium"
                    >
                      app.netlify.com/drop
                    </a>{' '}
                    to launch immediately in 5 seconds.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <a
                    href="/get-dressd-by-rissee-netlify-deploy.zip"
                    download="get-dressd-by-rissee-netlify-deploy.zip"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-medium transition-all shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Ready-to-Drop ZIP Bundle</span>
                  </a>
                  <a
                    href="https://app.netlify.com/drop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 text-[11px] text-stone-600 dark:text-stone-400 hover:text-teal-600 dark:hover:text-teal-400 py-1 transition-colors"
                  >
                    <span>Open Netlify Drop in New Tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick 2-Minute Netlify Setup Steps */}
            <div className="bg-white/80 dark:bg-stone-900/80 p-4 rounded-xl border border-teal-500/20 space-y-2">
              <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>How to Claim Your Free *.netlify.app Domain in 2 Minutes:</span>
              </p>
              <ol className="text-xs text-stone-600 dark:text-stone-400 space-y-1.5 list-decimal pl-4">
                <li>
                  Go to <a href="https://app.netlify.com" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 underline font-medium">Netlify.com</a> and sign in with GitHub, GitLab, or email (100% free account).
                </li>
                <li>
                  Click <strong className="text-stone-800 dark:text-stone-200">"Add new site" &rarr; "Import an existing project"</strong>, select your repository, and click Deploy (the build settings are automatically read from <code className="font-mono">netlify.toml</code>).
                </li>
                <li>
                  In <strong className="text-stone-800 dark:text-stone-200">Site Configuration &rarr; Site details &rarr; Change site name</strong>, type <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded text-teal-700 dark:text-teal-300">getdressdbyrissee</code>. Your boutique is instantly live at <strong className="text-stone-800 dark:text-stone-200">https://getdressdbyrissee.netlify.app</strong>!
                </li>
              </ol>
            </div>
          </div>

          {/* 1. Custom Domain Setup */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-medium text-sm">
              <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>1. Custom Web Domain (Boutique Website)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Primary Domain Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs text-stone-400 select-none">
                    https://
                  </span>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="getdressdbyrissee.ph"
                    className="w-full pl-20 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50 text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100"
                  />
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  Enter your purchased domain (e.g. from DotPH, Cloudflare, GoDaddy, or Namecheap).
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                  Apple App Store Link (Optional)
                </label>
                <input
                  type="url"
                  value={appStoreUrl}
                  onChange={(e) => setAppStoreUrl(e.target.value)}
                  placeholder="https://apps.apple.com/app/get-dressd-by-rissee/id..."
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50 text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100"
                />
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                  Once approved by Apple, paste your public App Store URL here to display direct badges.
                </p>
              </div>
            </div>

            {/* DNS Records Guide */}
            <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <span>Required DNS Records for Domain Registrar</span>
                </p>
                <span className="text-[10px] text-stone-500 uppercase tracking-widest font-mono">DNS Guide</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-stone-700 text-stone-500">
                      <th className="py-2 pr-3 font-semibold uppercase tracking-wider">Type</th>
                      <th className="py-2 px-3 font-semibold uppercase tracking-wider">Host / Name</th>
                      <th className="py-2 px-3 font-semibold uppercase tracking-wider">Target Value</th>
                      <th className="py-2 pl-3 font-semibold uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/60 dark:divide-stone-700/60 font-mono text-[11px]">
                    <tr>
                      <td className="py-2.5 pr-3 font-bold text-amber-700 dark:text-amber-400">A</td>
                      <td className="py-2.5 px-3 text-stone-900 dark:text-stone-100">@</td>
                      <td className="py-2.5 px-3 text-stone-600 dark:text-stone-300">76.76.21.21 (or Host IP)</td>
                      <td className="py-2.5 pl-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('76.76.21.21');
                            setCopiedKey('dns_a');
                            setTimeout(() => setCopiedKey(null), 2000);
                          }}
                          className="px-2 py-1 rounded bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 transition-colors"
                        >
                          {copiedKey === 'dns_a' ? 'Copied!' : 'Copy'}
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-3 font-bold text-amber-700 dark:text-amber-400">CNAME</td>
                      <td className="py-2.5 px-3 text-stone-900 dark:text-stone-100">www</td>
                      <td className="py-2.5 px-3 text-stone-600 dark:text-stone-300">{customDomain || 'getdressdbyrissee.ph'}</td>
                      <td className="py-2.5 pl-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(customDomain || 'getdressdbyrissee.ph');
                            setCopiedKey('dns_cname');
                            setTimeout(() => setCopiedKey(null), 2000);
                          }}
                          className="px-2 py-1 rounded bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 transition-colors"
                        >
                          {copiedKey === 'dns_cname' ? 'Copied!' : 'Copy'}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 2. Apple App Store Configuration & Live Sync */}
          <div className="space-y-4 pt-3 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-medium text-sm">
                <Apple className="w-4 h-4 text-stone-900 dark:text-stone-100" />
                <span>2. Apple App Store & Mobile App Architecture</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Zero-Rebuild Sync Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-stone-400">Bundle Identifier</p>
                <p className="font-mono text-stone-900 dark:text-stone-100 font-semibold text-xs">ph.getdressdbyrissee.app</p>
                <p className="text-[10px] text-stone-500">Configured in capacitor.config.ts</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-stone-400">App Category & Rating</p>
                <p className="text-stone-900 dark:text-stone-100 font-semibold text-xs">Shopping / Lifestyle (4+)</p>
                <p className="text-[10px] text-stone-500">Physical boutique garment rentals</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-800 space-y-1">
                <p className="text-[10px] uppercase font-bold text-stone-400">IAP 30% Fee Exemption</p>
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">Exempt (Guideline 3.1.5a)</p>
                <p className="text-[10px] text-stone-500">Physical goods: GCash & Bank allowed</p>
              </div>
            </div>

            {/* Explanatory Callout */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
              <p className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>How Live Synchronization Works (Zero Rebuilding Required):</span>
              </p>
              <p className="leading-relaxed text-[11px] text-stone-700 dark:text-stone-300">
                Whenever you add new Vietnamese dresses, modify rental prices (₱500–₱700), mark an item as <em>Reserved</em> or <em>Rented</em>, or upload high-res photos in this dashboard, the changes are saved directly to your live API. Both your <strong>public website</strong> and the <strong>Apple App Store mobile application</strong> fetch from this exact same live database immediately. You <strong>never</strong> have to rebuild or re-submit the app to Apple just to change inventory, prices, or photos!
              </p>
            </div>

            {/* Apple Reviewer Notes Copy Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  Ready-to-Use Notes for Apple App Store Reviewer
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const notes = `Dear Apple App Review Team,\n\nGet Dress'd by Rissée is a physical clothing rental service based in Metro Manila, Philippines. Customers use this app to browse real designer dresses, book fitting sessions at our local atelier, and arrange courier delivery/return of physical garments for weddings and celebrations.\n\nPer Apple Review Guideline 3.1.5(a), this application provides physical goods and services outside the app. Therefore, transactions are conducted via local Philippine payment mechanisms (GCash, Philippine Bank Transfer, Cash on Fitting) and do not utilize In-App Purchases.\n\nTest Owner Account (if needed):\nUser: caleb0621\nPass: munchkin0603#\n\nThank you for reviewing our app!`;
                    navigator.clipboard.writeText(notes);
                    setCopiedKey('apple_notes');
                    setTimeout(() => setCopiedKey(null), 2500);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 hover:underline font-medium"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'apple_notes' ? 'Copied Reviewer Notes!' : 'Copy Reviewer Notes'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 font-mono text-[11px] text-stone-700 dark:text-stone-300 leading-relaxed select-all">
                Dear Apple App Review Team: Get Dress'd by Rissée is a physical clothing rental atelier in the Philippines. Customers use this app to browse real designer dresses and book fitting appointments. Per Guideline 3.1.5(a), this app provides physical goods and services outside the app.
              </div>
            </div>
          </div>
        </div>

        {/* 1. TOP ANNOUNCEMENT BANNER */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <div>
              <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 font-medium">
                Top Announcement Banner
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Display promo alerts, rental notices, or seasonal notices at the very top of all customer pages.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
                className="rounded text-stone-900 focus:ring-stone-500"
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Enable Banner
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              Banner Text
            </label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="e.g. ✨ New Vietnamese Designer Arrivals Just Dropped • Enjoy Complimentary Fitting on 3-Day & 7-Day Rentals"
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
            />
          </div>
        </div>

        {/* 2. CHIBI DECORATIONS TOGGLE */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#dfc8b4]" />
                <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 font-medium">
                  Chibi Boutique Vector Decorations
                </h2>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Enable delicate, non-intrusive chibi illustrations wearing Vietnamese couture gowns in the page margins. Fully respects user motion preferences.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="chibi-decorations-toggle"
                checked={chibiDecorations}
                onChange={(e) => setChibiDecorations(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-stone-600 peer-checked:bg-stone-900 dark:peer-checked:bg-stone-100 dark:peer-checked:after:bg-stone-900"></div>
            </label>
          </div>
        </div>

        {/* 3. PHILIPPINE PAYMENT CONFIGURATION */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-8 shadow-xs">
          <div className="border-b border-stone-100 dark:border-stone-800 pb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h2 className="font-serif text-2xl text-stone-900 dark:text-stone-100 font-medium">
                Philippine Payment Methods
              </h2>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Configure accepted payment options (Cash, GCash, Philippine Bank Wire). Customers can view these across the boutique, rental inquiries, and dress detail pages.
            </p>
          </div>

          {/* Payment Disclaimer Setting */}
          <div className="space-y-2 bg-amber-50/60 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/40">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
              Payment Reservation Disclaimer
            </label>
            <textarea
              rows={2}
              value={paymentDisclaimer}
              onChange={(e) => setPaymentDisclaimer(e.target.value)}
              className="w-full px-4 py-2 rounded-xl text-xs bg-white dark:bg-stone-800 border border-amber-300 dark:border-amber-800 text-stone-900 dark:text-stone-100 focus:outline-none"
              placeholder="Payment confirmation may be required before your reservation is finalized."
            />
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              This notice appears prominently to customers informing them to submit proof of payment to finalize event reservations.
            </p>
          </div>

          {/* Cash Settings */}
          <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Banknote className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Cash Payment
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    For in-person showroom fitting or studio pick-up
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cashEnabled}
                  onChange={(e) => setCashEnabled(e.target.checked)}
                  className="rounded text-stone-900 focus:ring-stone-500"
                />
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Accept Cash
                </span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                Cash Instructions
              </label>
              <textarea
                rows={2}
                value={cashInstructions}
                onChange={(e) => setCashInstructions(e.target.value)}
                placeholder="Cash payment is accepted upon in-person studio fitting or garment pick-up arrangement."
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          {/* GCash Settings */}
          <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    GCash Mobile Wallet
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Direct mobile transfer & QR code payments
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gcashEnabled}
                  onChange={(e) => setGcashEnabled(e.target.checked)}
                  className="rounded text-stone-900 focus:ring-stone-500"
                />
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Accept GCash
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                  GCash Account Name
                </label>
                <input
                  type="text"
                  value={gcashAccountName}
                  onChange={(e) => setGcashAccountName(e.target.value)}
                  placeholder="Rissée R."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                  GCash Mobile Number
                </label>
                <input
                  type="text"
                  value={gcashAccountNumber}
                  onChange={(e) => setGcashAccountNumber(e.target.value)}
                  placeholder="0917 839 2841"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                Optional GCash QR Code Image URL
              </label>
              <input
                type="url"
                value={gcashQrCodeUrl}
                onChange={(e) => setGcashQrCodeUrl(e.target.value)}
                placeholder="https://example.com/gcash-qr.png"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                GCash Instructions
              </label>
              <textarea
                rows={2}
                value={gcashInstructions}
                onChange={(e) => setGcashInstructions(e.target.value)}
                placeholder="Send payment via GCash Express Send. Please save your reference number or screenshot to confirm your reservation."
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          {/* Philippine Bank Accounts */}
          <div className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-amber-600" />
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Philippine Bank Accounts
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Support multiple local banks (BDO, BPI, UnionBank, Metrobank, etc.)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddBank}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bank</span>
              </button>
            </div>

            <div className="space-y-4">
              {bankAccounts.map((bank, index) => (
                <div
                  key={bank.id || index}
                  className="bg-stone-50 dark:bg-stone-800/60 p-4 rounded-xl border border-stone-200/80 dark:border-stone-700/80 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                      Bank #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBank(bank.id)}
                      className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove Bank"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={bank.bank_name}
                        onChange={(e) => handleUpdateBank(bank.id, 'bank_name', e.target.value)}
                        placeholder="e.g. BDO Unibank"
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                        Account Name
                      </label>
                      <input
                        type="text"
                        value={bank.account_name}
                        onChange={(e) => handleUpdateBank(bank.id, 'account_name', e.target.value)}
                        placeholder="e.g. Rissée Couture Boutique"
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={bank.account_number}
                        onChange={(e) => handleUpdateBank(bank.id, 'account_number', e.target.value)}
                        placeholder="e.g. 0012 3456 7890"
                        className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-stone-500 mb-1">
                      Transfer Instructions (e.g. InstaPay / PESONet)
                    </label>
                    <input
                      type="text"
                      value={bank.instructions || ''}
                      onChange={(e) => handleUpdateBank(bank.id, 'instructions', e.target.value)}
                      placeholder="e.g. InstaPay supported 24/7. Over-the-counter deposit accepted."
                      className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. HOMEPAGE HERO CONFIGURATION */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-6 shadow-xs">
          <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 font-medium border-b border-stone-100 dark:border-stone-800 pb-3">
            Homepage Hero Section
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Hero Headline
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="Step into Elegance, Rent with Confidence"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Hero Background Image URL
              </label>
              <input
                type="url"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              Hero Subtitle
            </label>
            <textarea
              rows={2}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="Curated Vietnamese designer dresses, gala gowns, and bespoke cocktail couture in the Philippines."
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
            />
          </div>
        </div>

        {/* 5. ATELIER ABOUT SECTION CONFIGURATION */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-6 shadow-xs">
          <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 font-medium border-b border-stone-100 dark:border-stone-800 pb-3">
            Atelier & Founder Story Section
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                About Title
              </label>
              <input
                type="text"
                value={aboutTitle}
                onChange={(e) => setAboutTitle(e.target.value)}
                placeholder="The Art of Dressing with Rissée"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Atelier Portrait Image URL
              </label>
              <input
                type="url"
                value={aboutImageUrl}
                onChange={(e) => setAboutImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              Story Paragraph
            </label>
            <textarea
              rows={4}
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              placeholder="Founded with a passion for unforgettable Vietnamese couture..."
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
            />
          </div>
        </div>

        {/* 6. HOMEPAGE SECTIONS VISIBILITY TOGGLES */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-4 shadow-xs">
          <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 font-medium border-b border-stone-100 dark:border-stone-800 pb-3">
            Homepage Section Visibility Toggles
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {Object.keys(sectionsConfig).map((key) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer text-xs font-medium">
                <input
                  type="checkbox"
                  checked={(sectionsConfig as any)[key]}
                  onChange={(e) =>
                    setSectionsConfig({
                      ...sectionsConfig,
                      [key]: e.target.checked,
                    })
                  }
                  className="rounded text-stone-900 focus:ring-stone-500"
                />
                <span className="uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  {key} Section
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 7. BUSINESS CONTACT & HOURS */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-6 shadow-xs">
          <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 font-medium border-b border-stone-100 dark:border-stone-800 pb-3">
            Boutique Contact & Atelier Hours
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Boutique Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              Showroom Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2 border-t border-stone-100 dark:border-stone-800">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Mon - Fri Hours
              </label>
              <input
                type="text"
                value={hoursMonFri}
                onChange={(e) => setHoursMonFri(e.target.value)}
                placeholder="10:00 AM - 7:00 PM"
                className="w-full px-4 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Saturday Hours
              </label>
              <input
                type="text"
                value={hoursSat}
                onChange={(e) => setHoursSat(e.target.value)}
                placeholder="10:00 AM - 6:00 PM"
                className="w-full px-4 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Sunday Hours
              </label>
              <input
                type="text"
                value={hoursSun}
                onChange={(e) => setHoursSun(e.target.value)}
                placeholder="By Appointment Only"
                className="w-full px-4 py-2 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>
        </div>

        {/* Save Settings CTA */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="submit"
            id="bottom-save-settings-btn"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-white shadow transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save All Website Settings'}</span>
          </button>
        </div>

      </form>

      {/* 8. OWNER PASSWORD CHANGE CARD */}
      <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3 text-stone-900 dark:text-stone-100">
          <Lock className="w-4 h-4 text-[#dfc8b4]" />
          <h2 className="font-serif text-xl font-medium">Owner Password Security</h2>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md" id="update-password-form">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={updatingPassword}
            className="px-6 py-2.5 rounded-xl bg-stone-800 text-stone-100 text-xs font-semibold uppercase tracking-wider hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {updatingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

    </div>
  );
};
