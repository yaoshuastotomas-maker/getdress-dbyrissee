import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Sparkles,
  Mail,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  Eye,
  EyeOff,
  Tag
} from 'lucide-react';
import { DashboardStats, ActivityHistoryItem, Inquiry, formatPHP } from '../../types';
import { api } from '../../services/api';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [recentHistory, setRecentHistory] = useState<ActivityHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.stats.get(),
      api.inquiries.list(),
      api.history.list({ limit: 5 })
    ])
      .then(([statsData, inqs, hist]) => {
        if (!isMounted) return;
        setStats(statsData);
        setRecentInquiries(inqs.slice(0, 4));
        setRecentHistory(hist.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard data:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-stone-200 dark:bg-stone-800 w-1/4 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-24 bg-stone-200 dark:bg-stone-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Available Now',
      val: stats?.availableDresses ?? 0,
      sub: 'Ready for customer booking',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800'
    },
    {
      label: 'Reserved',
      val: stats?.reservedDresses ?? 0,
      sub: 'Booked for upcoming events',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800'
    },
    {
      label: 'Currently Rented',
      val: stats?.rentedDresses ?? 0,
      sub: 'In active client possession',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-800'
    },
    {
      label: 'Cleaning & Care',
      val: (stats as any)?.underCleaningDresses ?? (stats as any)?.unavailableDresses ?? 0,
      sub: 'Professional eco dry-cleaning',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      border: 'border-purple-200 dark:border-purple-800'
    },
    {
      label: 'Published Gowns',
      val: stats?.publishedDresses ?? 0,
      sub: 'Visible on customer website',
      color: 'text-stone-900 dark:text-stone-100',
      bg: 'bg-white dark:bg-stone-900',
      border: 'border-stone-200/80 dark:border-stone-800'
    },
    {
      label: 'Featured Pieces',
      val: stats?.featuredDresses ?? 0,
      sub: 'Pinned to curated homepage',
      color: 'text-stone-900 dark:text-stone-100',
      bg: 'bg-white dark:bg-stone-900',
      border: 'border-stone-200/80 dark:border-stone-800'
    },
    {
      label: 'Customer Inquiries',
      val: stats?.totalInquiries ?? 0,
      sub: `${stats?.pendingInquiries ?? 0} pending review`,
      color: stats?.pendingInquiries ? 'text-rose-600 dark:text-rose-400' : 'text-stone-900 dark:text-stone-100',
      bg: 'bg-white dark:bg-stone-900',
      border: stats?.pendingInquiries ? 'border-rose-300 dark:border-rose-800' : 'border-stone-200/80 dark:border-stone-800'
    },
    {
      label: 'Archived / Inactive',
      val: stats?.archivedDresses ?? 0,
      sub: 'Preserved in historical archive',
      color: 'text-stone-500 dark:text-stone-400',
      bg: 'bg-white dark:bg-stone-900',
      border: 'border-stone-200/80 dark:border-stone-800'
    }
  ];

  return (
    <div className="space-y-10">
      
      {/* Header Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-stone-500 dark:text-stone-400">
            Welcome back, Rissée
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 dark:text-stone-100 mt-1">
            Boutique Overview
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/admin/dresses/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-white shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dress</span>
          </Link>
          <Link
            to="/admin/inquiries"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium uppercase tracking-wider hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>Manage Inquiries</span>
          </Link>
          <Link
            to="/admin/settings"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium uppercase tracking-wider hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
          >
            <span>Edit Website</span>
          </Link>
        </div>
      </div>

      {/* 8 Stats Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between ${card.bg} ${card.border} transition-all`}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {card.label}
            </span>
            <div className="py-2">
              <span className={`font-serif text-3xl sm:text-4xl font-semibold ${card.color}`}>
                {card.val}
              </span>
            </div>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-light truncate">
              {card.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Two-Column Layout: Recently Added Dresses & Customer Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recently Added / Updated Dresses (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <h2 className="font-serif text-xl font-normal text-stone-900 dark:text-stone-100">
              Recently Added Gowns
            </h2>
            <Link
              to="/admin/dresses"
              className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1"
            >
              <span>View All Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {stats?.recentlyAddedDresses && stats.recentlyAddedDresses.length > 0 ? (
              stats.recentlyAddedDresses.map((dress: any) => (
                <div key={dress.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={dress.primary_image_url || dress.images?.[0]?.url || ''}
                      alt={dress.name}
                      className="w-12 h-14 object-cover rounded-xl bg-stone-100 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100 line-clamp-1">
                        <Link to={`/admin/dresses/${dress.id}/edit`} className="hover:underline">
                          {dress.name}
                        </Link>
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        <span>{dress.category_name}</span>
                        <span>•</span>
                        <strong className="text-stone-800 dark:text-stone-200">{formatPHP(dress.rental_price)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        dress.availability === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                    >
                      {dress.availability}
                    </span>
                    <Link
                      to={`/admin/dresses/${dress.id}/edit`}
                      className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-medium"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-stone-400 py-6 text-center">No dresses added yet.</p>
            )}
          </div>
        </div>

        {/* Recent Inquiries & Activity (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Customer Inquiries Card */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h2 className="font-serif text-xl font-normal text-stone-900 dark:text-stone-100">
                Latest Inquiries
              </h2>
              <Link
                to="/admin/inquiries"
                className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1"
              >
                <span>View Inquiries</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentInquiries.length > 0 ? (
                recentInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                        {inq.customer_name}
                      </strong>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          ['INQUIRY_RECEIVED', 'REVIEWING', 'MORE_INFO_NEEDED'].includes(inq.status)
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {inq.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                      {inq.dress_name ? `Regarding: ${inq.dress_name}` : inq.message}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-400 py-4 text-center">No inquiries yet.</p>
              )}
            </div>
          </div>

          {/* Quick Activity Audit Card */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <h2 className="font-serif text-lg font-normal text-stone-900 dark:text-stone-100">
                Recent Activity
              </h2>
              <Link
                to="/admin/history"
                className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
              >
                Full Audit Trail
              </Link>
            </div>

            <div className="space-y-2.5 text-xs text-stone-600 dark:text-stone-400">
              {recentHistory.map((item) => (
                <div key={item.id} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#dfc8b4] mt-1.5 shrink-0" />
                  <div className="flex-1 leading-relaxed">
                    <span>{item.description}</span>
                    <span className="block text-[10px] text-stone-400">
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.user_responsible}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
