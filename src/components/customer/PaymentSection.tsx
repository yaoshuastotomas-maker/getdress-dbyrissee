import React, { useState } from 'react';
import {
  Banknote,
  Smartphone,
  Building2,
  Copy,
  Check,
  AlertCircle,
  QrCode,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { WebsiteSettings, PaymentSettings } from '../../types';
import { useToast } from '../../context/ToastContext';

interface PaymentSectionProps {
  settings?: WebsiteSettings | null;
  compact?: boolean;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({ settings, compact = false }) => {
  const { success } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  const defaultPayment: PaymentSettings = {
    cash: {
      enabled: true,
      instructions: 'Cash payment is accepted upon in-person studio fitting or garment pick-up arrangement.',
    },
    gcash: {
      enabled: true,
      account_name: 'Rissée R.',
      account_number: '0917 839 2841',
      instructions: 'Send payment via GCash Express Send. Please save your reference number or screenshot to confirm your reservation.',
      qr_code_url: '',
    },
    banks: [
      {
        id: 'bank-bdo',
        bank_name: 'BDO Unibank',
        account_name: 'Rissée Couture Boutique',
        account_number: '0012 3456 7890',
        instructions: 'Online bank transfer or over-the-counter deposit.',
      },
      {
        id: 'bank-bpi',
        bank_name: 'Bank of the Philippine Islands (BPI)',
        account_name: 'Rissée Couture Boutique',
        account_number: '1234 5678 90',
        instructions: 'InstaPay or PESONet transfer supported.',
      },
      {
        id: 'bank-ubp',
        bank_name: 'UnionBank of the Philippines',
        account_name: 'Rissée Couture Boutique',
        account_number: '1098 7654 3210',
        instructions: 'Instant transfer via InstaPay 24/7.',
      },
    ],
    disclaimer: 'Payment confirmation may be required before your reservation is finalized.',
  };

  const payment = settings?.payment || defaultPayment;
  const disclaimer = payment.disclaimer || 'Payment confirmation may be required before your reservation is finalized.';

  const copyToClipboard = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    success(`Copied ${label} to clipboard!`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  return (
    <section id="payment-methods-section" className="space-y-10">
      
      {/* Section Header */}
      {!compact && (
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500 dark:text-stone-400">
            Payment & Reservations
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 dark:text-stone-100">
            Philippine Payment Methods
          </h2>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 font-light leading-relaxed">
            Convenient, secure payment options for Vietnamese designer dress rentals in the Philippines.
          </p>
        </div>
      )}

      {/* Prominent Payment Disclaimer Banner */}
      <div
        id="payment-disclaimer-banner"
        className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5 sm:p-6 shadow-xs flex items-start gap-4"
      >
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
              Important Booking Note
            </span>
          </div>
          <p className="text-sm font-medium text-amber-950 dark:text-amber-100 leading-snug">
            “{disclaimer}”
          </p>
          <p className="text-xs text-amber-800/90 dark:text-amber-300/80 leading-relaxed font-light">
            Submitting a dress inquiry reserves a temporary hold subject to boutique review. Sending proof of payment (transaction screenshot or reference number) finalizes your event reservation on our boutique calendar.
          </p>
        </div>
      </div>

      {/* Payment Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Cash Card */}
        {payment.cash?.enabled && (
          <div
            id="payment-cash-card"
            className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-6 hover:border-stone-300 dark:hover:border-stone-700 transition-all"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <Banknote className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  In-Person / Atelier
                </span>
                <h3 className="font-serif text-2xl font-medium text-stone-900 dark:text-stone-100 mt-0.5">
                  Cash Payment
                </h3>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-light">
                {payment.cash.instructions || 'Cash payment is accepted upon in-person studio fitting or garment pick-up arrangement.'}
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Fitting studio verification</span>
              </div>
              <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400 text-xs">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Exact cash or receipt upon pick-up</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. GCash Card */}
        {payment.gcash?.enabled && (
          <div
            id="payment-gcash-card"
            className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-6 hover:border-blue-300 dark:hover:border-blue-900/60 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  GCash Wallet
                </span>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-medium text-stone-900 dark:text-stone-100">
                  GCash Express
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Fast mobile transfer with instant digital confirmation.
                </p>
              </div>

              {/* Account Details Box */}
              <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 space-y-3 border border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Account Name
                  </span>
                  <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    {payment.gcash.account_name}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-200/60 dark:border-stone-700/60">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 block">
                      GCash Number
                    </span>
                    <span className="text-sm font-mono font-bold text-stone-900 dark:text-stone-100">
                      {payment.gcash.account_number}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        payment.gcash.account_number.replace(/\s+/g, ''),
                        'gcash',
                        'GCash Number'
                      )
                    }
                    className="p-2 rounded-xl bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-600 transition-colors shrink-0 flex items-center gap-1.5 text-xs font-medium"
                    title="Copy GCash number"
                  >
                    {copiedKey === 'gcash' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold text-[11px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-light">
                {payment.gcash.instructions}
              </p>
            </div>

            {payment.gcash.qr_code_url && (
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider hover:bg-blue-100/70 transition-colors flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>View GCash QR Code</span>
              </button>
            )}
          </div>
        )}

        {/* 3. Philippine Bank Transfers Card */}
        <div
          id="payment-banks-card"
          className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-6 hover:border-stone-300 dark:hover:border-stone-700 transition-all"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                InstaPay / PESONet
              </span>
            </div>

            <div>
              <h3 className="font-serif text-2xl font-medium text-stone-900 dark:text-stone-100">
                Philippine Banks
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Online bank transfers and over-the-counter branch deposits.
              </p>
            </div>

            {/* List of configured Philippine Bank Accounts */}
            <div className="space-y-3">
              {payment.banks && payment.banks.length > 0 ? (
                payment.banks.map((bank, idx) => (
                  <div
                    key={bank.id || idx}
                    className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-3.5 border border-stone-100 dark:border-stone-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                        {bank.bank_name}
                      </span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate max-w-[120px]">
                        {bank.account_name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-mono font-semibold text-stone-800 dark:text-stone-200">
                        {bank.account_number}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            bank.account_number.replace(/\s+/g, ''),
                            `bank-${idx}`,
                            `${bank.bank_name} Account Number`
                          )
                        }
                        className="px-2 py-1 rounded-lg bg-white dark:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-600 transition-colors flex items-center gap-1 text-[11px]"
                      >
                        {copiedKey === `bank-${idx}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {bank.instructions && (
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                        {bank.instructions}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-stone-500 p-3 bg-stone-50 dark:bg-stone-800 rounded-xl">
                  Contact Rissée for direct bank wire details.
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-stone-400 shrink-0" />
            <span>Send transfer reference code via email or inquiry form.</span>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && payment.gcash?.qr_code_url && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 shadow-2xl border border-stone-200 dark:border-stone-800 text-center">
            <h4 className="font-serif text-2xl font-medium text-stone-900 dark:text-stone-100">
              GCash QR Code
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Scan with your GCash app to send reservation payment
            </p>
            <div className="p-3 bg-white rounded-2xl inline-block border border-stone-200 mx-auto">
              <img
                src={payment.gcash.qr_code_url}
                alt="GCash QR Code"
                className="w-56 h-56 object-contain rounded-xl"
              />
            </div>
            <div className="text-xs text-stone-700 dark:text-stone-300 font-medium">
              {payment.gcash.account_name} • {payment.gcash.account_number}
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
