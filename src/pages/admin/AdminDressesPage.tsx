import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
  ExternalLink,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Tag,
  LayoutGrid,
  List,
  Calendar,
  Layers
} from 'lucide-react';
import { Dress, Category, AvailabilityStatus, formatPHP } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { SafeImage } from '../../components/common/SafeImage';

export const AdminDressesPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [dresses, setDresses] = useState<Dress[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');

  // Confirmation Modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'archive' | 'delete' | 'restore';
    dress: Dress | null;
  }>({ isOpen: false, type: 'archive', dress: null });

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.dresses.list({}, true), // true = includeArchived
      api.categories.list()
    ])
      .then(([dressRes, catRes]) => {
        setDresses(dressRes.data);
        setCategories(catRes);
        setLoading(false);
      })
      .catch((err) => {
        toastError('Failed to load dresses: ' + err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered dataset
  const filteredDresses = useMemo(() => {
    return dresses.filter((d) => {
      // Tab filter
      if (activeTab === 'active' && d.archived) return false;
      if (activeTab === 'archived' && !d.archived) return false;

      // Search (matches name, code, category, color)
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = d.name?.toLowerCase().includes(q);
        const matchesCode = d.dress_code?.toLowerCase().includes(q) || d.id?.toLowerCase().includes(q);
        const matchesCat = d.category_name?.toLowerCase().includes(q);
        const matchesColor = d.colors?.some((c) => c.toLowerCase().includes(q));
        if (!matchesName && !matchesCode && !matchesCat && !matchesColor) return false;
      }

      // Category
      if (categoryFilter !== 'ALL' && d.category_id !== categoryFilter) return false;

      // Availability
      if (availabilityFilter !== 'ALL' && d.availability !== availabilityFilter) return false;

      return true;
    });
  }, [dresses, activeTab, search, categoryFilter, availabilityFilter]);

  // Quick Availability Status Changer
  const handleQuickAvailabilityChange = async (dress: Dress, newStatus: AvailabilityStatus) => {
    try {
      const updated = await api.dresses.update(dress.id, {
        availability: newStatus,
      });
      setDresses((prev) => prev.map((d) => (d.id === dress.id ? updated : d)));
      success(`Updated "${dress.name}" to ${newStatus}`);
    } catch (err: any) {
      toastError(err.message || 'Failed to update availability');
    }
  };

  // Quick Visibility Toggle
  const handleTogglePublished = async (dress: Dress) => {
    try {
      const updated = await api.dresses.update(dress.id, {
        published: !dress.published,
      });
      setDresses((prev) => prev.map((d) => (d.id === dress.id ? updated : d)));
      success(`"${dress.name}" is now ${updated.published ? 'Published' : 'Hidden'}.`);
    } catch (err: any) {
      toastError(err.message || 'Failed to update visibility');
    }
  };

  // Quick Featured Toggle
  const handleToggleFeatured = async (dress: Dress) => {
    try {
      const updated = await api.dresses.update(dress.id, {
        featured: !dress.featured,
      });
      setDresses((prev) => prev.map((d) => (d.id === dress.id ? updated : d)));
      success(`"${dress.name}" featured status updated.`);
    } catch (err: any) {
      toastError(err.message || 'Failed to update featured status');
    }
  };

  // Quick Duplicate
  const handleDuplicate = async (dress: Dress) => {
    try {
      const duplicated = await api.dresses.duplicate(dress.id);
      success(`Duplicated "${dress.name}". Opening editor...`);
      navigate(`/admin/dresses/${duplicated.id}/edit`);
    } catch (err: any) {
      toastError(err.message || 'Failed to duplicate dress');
    }
  };

  // Confirmation Modal Action (Archive / Restore / Delete)
  const handleConfirmAction = async () => {
    const { type, dress } = confirmModal;
    if (!dress) return;

    try {
      if (type === 'archive') {
        await api.dresses.archive(dress.id);
        success(`"${dress.name}" moved to archives.`);
      } else if (type === 'restore') {
        await api.dresses.restore(dress.id);
        success(`"${dress.name}" restored to active catalog.`);
      } else if (type === 'delete') {
        await api.dresses.delete(dress.id);
        success(`"${dress.name}" permanently deleted.`);
      }
      setConfirmModal({ isOpen: false, type: 'archive', dress: null });
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-stone-900 dark:text-stone-100">
            Dress Catalog Management
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Manage your boutique inventory, pricing, availability, and photoshoot imagery.
          </p>
        </div>

        <Link
          to="/admin/dresses/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-white shadow transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Dress</span>
        </Link>
      </div>

      {/* Tabs, Search & Filters Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Active vs Archived Tabs */}
          <div className="flex items-center gap-2 border-b md:border-b-0 border-stone-200 dark:border-stone-800 pb-2 md:pb-0">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'active'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              Active Catalog ({dresses.filter((d) => !d.archived).length})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'archived'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              Archived ({dresses.filter((d) => d.archived).length})
            </button>
          </div>

          {/* Search & View Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, dress ID (e.g. RIS-001), color..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
              />
            </div>

            <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-xl p-1 border border-stone-200 dark:border-stone-700 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg ${viewMode === 'table' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' : 'text-stone-400'}`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' : 'text-stone-400'}`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex items-center gap-4 pt-2 border-t border-stone-100 dark:border-stone-800 flex-wrap">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 uppercase tracking-wider font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 uppercase tracking-wider font-medium">Availability:</span>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="RENTED">Rented</option>
              <option value="UNDER_CLEANING">Under Cleaning</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>

          {(search || categoryFilter !== 'ALL' || availabilityFilter !== 'ALL') && (
            <button
              onClick={() => { setSearch(''); setCategoryFilter('ALL'); setAvailabilityFilter('ALL'); }}
              className="text-xs text-[#a47e62] hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-500 dark:text-stone-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Gown & Code</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Sizes & Colors</th>
                  <th className="py-3.5 px-4">Rental Rate</th>
                  <th className="py-3.5 px-4">Quick Status</th>
                  <th className="py-3.5 px-4">Visibility</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-stone-400 animate-pulse">
                      Loading dress inventory...
                    </td>
                  </tr>
                ) : filteredDresses.length > 0 ? (
                  filteredDresses.map((dress) => (
                    <tr key={dress.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                      
                      {/* Gown Thumbnail & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200/60 dark:border-stone-800">
                            <SafeImage
                              src={dress.primary_image_url || dress.images?.[0]?.url || ''}
                              alt={dress.name}
                              fallbackTitle="Gown"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <Link
                              to={`/admin/dresses/${dress.id}/edit`}
                              className="font-medium text-stone-900 dark:text-stone-100 hover:underline line-clamp-1 text-sm"
                            >
                              {dress.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {dress.dress_code && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-[10px] font-mono font-medium text-stone-700 dark:text-stone-300">
                                  <Tag className="w-2.5 h-2.5 text-[#a47e62]" />
                                  <span>{dress.dress_code}</span>
                                </span>
                              )}
                              {dress.featured && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-[#a47e62] dark:text-[#dfc8b4] font-semibold">
                                  <Sparkles className="w-3 h-3" />
                                  <span>Featured</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-stone-600 dark:text-stone-400">
                        {dress.category_name || 'Unassigned'}
                      </td>

                      {/* Sizes & Colors */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {dress.sizes?.slice(0, 3).map((s) => (
                              <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                                {s}
                              </span>
                            ))}
                            {(dress.sizes?.length || 0) > 3 && (
                              <span className="text-[10px] text-stone-400">+{dress.sizes!.length - 3}</span>
                            )}
                          </div>
                          <div className="text-[10px] text-stone-400 truncate max-w-[120px]">
                            {dress.colors?.join(', ')}
                          </div>
                        </div>
                      </td>

                      {/* Pricing & Duration */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                            {formatPHP(dress.rental_price)}
                          </span>
                          <div className="text-[10px] text-stone-400 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>{dress.rental_duration || '3-Day'}</span>
                          </div>
                          {dress.sale_price && dress.sale_price > 0 && (
                            <div className="text-[10px] text-stone-500">
                              Sale: {formatPHP(dress.sale_price)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Quick Availability Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={dress.availability}
                          onChange={(e) => handleQuickAvailabilityChange(dress, e.target.value as AvailabilityStatus)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border focus:outline-none transition-colors cursor-pointer ${
                            dress.availability === 'AVAILABLE'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                              : dress.availability === 'RESERVED'
                              ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                              : dress.availability === 'RENTED'
                              ? 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800'
                              : dress.availability === 'UNDER_CLEANING'
                              ? 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800'
                              : 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700'
                          }`}
                        >
                          <option value="AVAILABLE">Available</option>
                          <option value="RESERVED">Reserved</option>
                          <option value="RENTED">Rented</option>
                          <option value="UNDER_CLEANING">Under Cleaning</option>
                          <option value="UNAVAILABLE">Unavailable</option>
                        </select>
                      </td>

                      {/* Visibility & Featured toggles */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTogglePublished(dress)}
                            title={dress.published ? 'Published (Click to hide from customers)' : 'Hidden (Click to publish)'}
                            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                              dress.published
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                : 'bg-stone-100 text-stone-400 dark:bg-stone-800'
                            }`}
                          >
                            {dress.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(dress)}
                            title={dress.featured ? 'Featured on Homepage (Click to unfeature)' : 'Click to feature on homepage'}
                            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                              dress.featured
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                                : 'bg-stone-100 text-stone-400 dark:bg-stone-800'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/dresses/${dress.id}/edit`}
                            title="Edit dress"
                            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(dress)}
                            title="Duplicate dress"
                            className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {activeTab === 'active' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setConfirmModal({ isOpen: true, type: 'archive', dress })}
                                title="Archive dress"
                                className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmModal({ isOpen: true, type: 'delete', dress })}
                                title="Delete dress permanently"
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setConfirmModal({ isOpen: true, type: 'restore', dress })}
                                title="Restore to active catalog"
                                className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmModal({ isOpen: true, type: 'delete', dress })}
                                title="Delete permanently"
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
                          <Layers className="w-6 h-6" />
                        </div>
                        <h3 className="font-serif text-lg text-stone-900 dark:text-stone-100 font-medium">
                          {dresses.length === 0 ? 'No Dresses Added Yet' : 'No Gowns Found'}
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {dresses.length === 0
                            ? 'Your boutique inventory is clean and ready. Click below to add your first real designer dress.'
                            : 'No dresses match the current search or filters.'}
                        </p>
                        {dresses.length === 0 && (
                          <Link
                            to="/admin/dresses/new"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-wider mt-2 shadow"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Your First Dress</span>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visual Card Grid View */
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] bg-stone-200 dark:bg-stone-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredDresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDresses.map((dress) => (
                <div
                  key={dress.id}
                  className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-sm flex flex-col justify-between group"
                >
                  <div className="relative aspect-[3/4] bg-stone-100 dark:bg-stone-800">
                    <SafeImage
                      src={dress.primary_image_url || dress.images?.[0]?.url || ''}
                      alt={dress.name}
                      fallbackTitle={dress.name}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                      {dress.featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-900/90 text-white backdrop-blur-sm">
                          <Sparkles className="w-2.5 h-2.5 text-[#dfc8b4]" />
                          Featured
                        </span>
                      )}
                      {dress.dress_code && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-stone-900/80 text-stone-200 backdrop-blur-sm">
                          {dress.dress_code}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2.5 right-2.5">
                      <select
                        value={dress.availability}
                        onChange={(e) => handleQuickAvailabilityChange(dress, e.target.value as AvailabilityStatus)}
                        className="text-[10px] font-semibold px-2 py-1 rounded-full bg-white/95 dark:bg-stone-900/95 text-stone-900 dark:text-white backdrop-blur-sm border shadow-sm focus:outline-none"
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="RESERVED">Reserved</option>
                        <option value="RENTED">Rented</option>
                        <option value="UNDER_CLEANING">Cleaning</option>
                        <option value="UNAVAILABLE">Unavailable</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-[#a47e62] tracking-wider block">
                        {dress.category_name || 'Unassigned'}
                      </span>
                      <h3 className="font-serif text-base font-medium text-stone-900 dark:text-stone-100 line-clamp-1 mt-0.5">
                        {dress.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="font-semibold text-stone-900 dark:text-stone-100">
                          {formatPHP(dress.rental_price)} / rent
                        </span>
                        <span className="text-[11px] text-stone-400">
                          {dress.sizes?.join(', ')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                      <Link
                        to={`/admin/dresses/${dress.id}/edit`}
                        className="text-xs font-semibold uppercase text-stone-900 dark:text-stone-100 hover:text-[#a47e62] flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Gown</span>
                      </Link>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleTogglePublished(dress)}
                          title={dress.published ? 'Published' : 'Hidden'}
                          className={`p-1.5 rounded-lg ${dress.published ? 'text-emerald-600' : 'text-stone-400'}`}
                        >
                          {dress.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmModal({ isOpen: true, type: 'delete', dress })}
                          title="Delete dress"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800">
              <p className="text-xs text-stone-400">No dresses match the selected criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmModal.isOpen && confirmModal.dress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100 capitalize">
                {confirmModal.type} Dress
              </h3>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Are you sure you want to {confirmModal.type} <strong>"{confirmModal.dress.name}"</strong>
              {confirmModal.dress.dress_code ? ` (${confirmModal.dress.dress_code})` : ''}?
              {confirmModal.type === 'delete' && ' This will permanently remove the dress and all associated photos from your boutique catalog.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, type: 'archive', dress: null })}
                className="px-4 py-2 rounded-xl text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-white shadow ${
                  confirmModal.type === 'delete' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-stone-900 dark:bg-stone-100 dark:text-stone-900'
                }`}
              >
                Confirm {confirmModal.type}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
