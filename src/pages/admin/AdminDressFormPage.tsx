import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Sparkles,
  Trash2,
  Star,
  MoveLeft,
  MoveRight,
  Plus,
  Check,
  X,
  Image as ImageIcon,
  Save,
  Tag,
  Clock,
  DollarSign,
  AlertTriangle,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Dress, Category, AvailabilityStatus, DressImage } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { optimizeImageFile } from '../../utils/imageOptimizer';
import { SafeImage } from '../../components/common/SafeImage';

export const AdminDressFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [dressCode, setDressCode] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [rentalPrice, setRentalPrice] = useState<number | ''>('');
  const [rentalDuration, setRentalDuration] = useState('3 Days (Standard)');
  const [allowSale, setAllowSale] = useState(false);
  const [salePrice, setSalePrice] = useState<number | ''>('');
  const [occasion, setOccasion] = useState('Weddings');
  const [availability, setAvailability] = useState<AvailabilityStatus>('AVAILABLE');
  const [notes, setNotes] = useState('');
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);

  // Tags
  const [sizes, setSizes] = useState<string[]>(['S', 'M']);
  const [newSizeInput, setNewSizeInput] = useState('');
  const [colors, setColors] = useState<string[]>(['Blush Rose']);
  const [newColorInput, setNewColorInput] = useState('');

  // Images
  const [images, setImages] = useState<DressImage[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Quick presets
  const standardSizes = ['0', '2', '4', '6', '8', '10', '12', '14', 'XS', 'S', 'M', 'L', 'XL', 'Free Size'];
  const quickColors = ['Blush Rose', 'Champagne', 'Ivory Pearl', 'Noir', 'Emerald Green', 'Ruby Red', 'Pastel Gold', 'Soft Cream', 'Sky Blue', 'Burgundy'];
  const durationPresets = ['3 Days (Standard)', '4 Days', '5 Days (Extended)', '7 Days (Weekly)', 'Custom Schedule'];

  useEffect(() => {
    let isMounted = true;

    api.categories.list().then((cats) => {
      if (isMounted) {
        const activeCats = cats.filter((c) => !c.archived);
        setCategories(activeCats);
        if (!isEditing && activeCats.length > 0 && !categoryId) {
          setCategoryId(activeCats[0].id);
        }
      }
    });

    if (isEditing && id) {
      api.dresses
        .getBySlugOrId(id)
        .then((data) => {
          if (!isMounted) return;
          setName(data.name);
          setDressCode(data.dress_code || '');
          setSlug(data.slug);
          setCategoryId(data.category_id || '');
          setDescription(data.description || '');
          setRentalPrice(data.rental_price);
          setRentalDuration(data.rental_duration || '3 Days (Standard)');
          if (data.sale_price && data.sale_price > 0) {
            setAllowSale(true);
            setSalePrice(data.sale_price);
          } else {
            setAllowSale(false);
            setSalePrice('');
          }
          setOccasion(data.occasion || 'Weddings');
          setAvailability(data.availability);
          setNotes(data.notes || '');
          setPublished(data.published);
          setFeatured(data.featured);
          setSizes(data.sizes || []);
          setColors(data.colors || []);
          setImages(data.images || []);
          setLoading(false);
        })
        .catch((err) => {
          toastError('Failed to load dress: ' + err.message);
          setLoading(false);
        });
    } else {
      // Auto-suggest dress code for new dress
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      setDressCode(`RIS-${randomSuffix}`);
    }

    return () => {
      isMounted = false;
    };
  }, [id, isEditing]);

  // Auto-generate slug when name changes for new dress
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing || !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleGenerateDressCode = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setDressCode(`RIS-${randomSuffix}`);
  };

  // Sizing handlers
  const toggleStandardSize = (sz: string) => {
    if (sizes.includes(sz)) {
      setSizes(sizes.filter((s) => s !== sz));
    } else {
      setSizes([...sizes, sz]);
    }
  };

  const handleAddCustomSize = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newSizeInput.trim() && !sizes.includes(newSizeInput.trim())) {
      setSizes([...sizes, newSizeInput.trim()]);
      setNewSizeInput('');
    }
  };

  const removeSize = (sz: string) => {
    setSizes(sizes.filter((s) => s !== sz));
  };

  // Color handlers
  const toggleQuickColor = (clr: string) => {
    if (colors.includes(clr)) {
      setColors(colors.filter((c) => c !== clr));
    } else {
      setColors([...colors, clr]);
    }
  };

  const handleAddColor = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newColorInput.trim() && !colors.includes(newColorInput.trim())) {
      setColors([...colors, newColorInput.trim()]);
      setNewColorInput('');
    }
  };

  const removeColor = (clr: string) => {
    setColors(colors.filter((c) => c !== clr));
  };

  // Image Upload Handlers with Automatic Client Optimization
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress(`Optimizing photo ${i + 1} of ${fileArray.length}...`);

        // Compress and optimize image on client
        const optimized = await optimizeImageFile(file, {
          maxDimension: 1400,
          quality: 0.84,
          mimeType: 'image/jpeg',
        });

        let photoUrl = optimized.dataUrl;

        // Try upload to backend if supported, else fallback to optimized data URL
        try {
          const res = await api.uploads.single(optimized.file);
          if (res && res.url) {
            photoUrl = res.url;
          }
        } catch {
          // Keep optimized dataUrl (compressed to lightweight size)
        }

        const newImg: DressImage = {
          url: photoUrl,
          is_primary: images.length === 0 && i === 0,
          display_order: images.length + i,
          alt_text: `${name || 'Dress'} photoshoot photo ${images.length + i + 1}`,
        };

        setImages((prev) => [...prev, newImg]);
      }
      success(`Added ${fileArray.length} optimized photo(s) to gallery.`);
    } catch (err: any) {
      toastError(err.message || 'Image processing failed');
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    const newImg: DressImage = {
      url: urlInput.trim(),
      is_primary: images.length === 0,
      display_order: images.length,
      alt_text: `${name || 'Dress'} photo`,
    };
    setImages((prev) => [...prev, newImg]);
    setUrlInput('');
    success('Photo URL added to gallery.');
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        is_primary: idx === index,
      }))
    );
  };

  const deleteImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      if (filtered.length > 0 && !filtered.some((img) => img.is_primary)) {
        filtered[0].is_primary = true;
      }
      return filtered;
    });
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && index === 0) ||
      (direction === 'right' && index === images.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    updated.forEach((img, idx) => {
      img.display_order = idx;
    });
    setImages(updated);
  };

  // Form Submit
  const handleSave = async (addAnother: boolean = false) => {
    if (!name.trim()) {
      toastError('Please provide a dress name.');
      return;
    }
    if (rentalPrice === '') {
      toastError('Please specify the rental price (in PHP).');
      return;
    }

    setSaving(true);
    const primaryImgUrl = images.find((i) => i.is_primary)?.url || images[0]?.url || '';

    const payload = {
      name: name.trim(),
      dress_code: dressCode.trim().toUpperCase(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category_id: categoryId,
      description: description.trim(),
      rental_price: Number(rentalPrice),
      rental_duration: rentalDuration.trim(),
      sale_price: allowSale && salePrice !== '' ? Number(salePrice) : null,
      occasion: occasion.trim(),
      availability,
      sizes,
      colors,
      notes: notes.trim(),
      published,
      featured,
      primary_image_url: primaryImgUrl,
      images,
    };

    try {
      if (isEditing && id) {
        await api.dresses.update(id, payload);
        success(`"${name}" updated successfully.`);
        navigate('/admin/dresses');
      } else {
        await api.dresses.create(payload);
        success(`"${name}" created successfully.`);
        if (addAnother) {
          // Reset form fields for rapid data entry
          setName('');
          const randomSuffix = Math.floor(100 + Math.random() * 900);
          setDressCode(`RIS-${randomSuffix}`);
          setSlug('');
          setDescription('');
          setRentalPrice(650);
          setAllowSale(false);
          setSalePrice('');
          setNotes('');
          setImages([]);
          setFeatured(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          navigate('/admin/dresses');
        }
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to save dress');
    } finally {
      setSaving(false);
    }
  };

  // Permanent Delete
  const handleDeleteDress = async () => {
    if (!id || !isEditing) return;
    setDeleting(true);
    try {
      await api.dresses.delete(id);
      success(`"${name}" permanently deleted from inventory.`);
      navigate('/admin/dresses');
    } catch (err: any) {
      toastError(err.message || 'Failed to delete dress');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse max-w-5xl mx-auto py-8">
        <div className="h-8 bg-stone-200 dark:bg-stone-800 w-1/4 rounded-xl" />
        <div className="h-96 bg-stone-200 dark:bg-stone-800 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/dresses"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
        <div className="flex items-center gap-3">
          {isEditing && slug && (
            <Link
              to={`/dresses/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
            >
              <span>View Live on Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
          <span className="text-xs text-stone-400 font-mono">
            {isEditing ? `ID: ${dressCode || id}` : 'Drafting New Gown'}
          </span>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(false); }} className="space-y-8">
        
        {/* Page Title & Save Button Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h1 className="font-serif text-3xl font-normal text-stone-900 dark:text-stone-100">
              {isEditing ? `Edit: ${name || 'Dress'}` : 'Add New Designer Gown'}
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Add photos, set rental rates, configure sizing, and control boutique availability.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {isEditing && (
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                className="px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Listing</span>
              </button>
            )}

            <Link
              to="/admin/dresses"
              className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-medium uppercase tracking-wider text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Cancel
            </Link>

            {!isEditing && (
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(true)}
                className="px-4 py-2.5 rounded-xl border border-stone-800 dark:border-stone-300 text-stone-900 dark:text-stone-100 text-xs font-semibold uppercase tracking-wider hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                Save & Add Another
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-white shadow transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Gown'}</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: BASIC IDENTIFICATION & DETAILS */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <Tag className="w-5 h-5 text-[#a47e62] dark:text-[#dfc8b4]" />
            <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 font-medium">
              Gown Identification & Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Dress Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. The Sài Gòn Lụa Draped Rose Gown"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  Unique Dress ID / SKU
                </label>
                <button
                  type="button"
                  onClick={handleGenerateDressCode}
                  className="text-[10px] text-[#a47e62] hover:underline uppercase font-medium"
                >
                  Generate ID
                </button>
              </div>
              <input
                type="text"
                value={dressCode}
                onChange={(e) => setDressCode(e.target.value.toUpperCase())}
                placeholder="e.g. RIS-001"
                className="w-full px-4 py-2.5 rounded-xl text-sm font-mono uppercase bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                URL Slug <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="the-sai-gon-lua-draped-rose-gown"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-stone-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Category / Occasion Collection <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              Description & Silhouette Details
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the fabric, corsetry, neckline, drape, movement, and styling suggestions..."
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500 leading-relaxed"
            />
          </div>
        </div>

        {/* SECTION 2: PRICING, DURATION & AVAILABILITY */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <DollarSign className="w-5 h-5 text-[#a47e62] dark:text-[#dfc8b4]" />
            <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 font-medium">
              Rental Pricing & Availability Status
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Rental Price (PHP) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-semibold">₱</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={rentalPrice}
                  onChange={(e) => setRentalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="650"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-semibold focus:outline-none focus:ring-2 focus:ring-stone-500"
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-1">
                Typical range: ₱500 – ₱700 per rental
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Rental Duration
              </label>
              <select
                value={rentalDuration}
                onChange={(e) => setRentalDuration(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
              >
                {durationPresets.map((dp) => (
                  <option key={dp} value={dp}>{dp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Availability Status <span className="text-rose-500">*</span>
              </label>
              <select
                value={availability}
                onChange={(e: any) => setAvailability(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
              >
                <option value="AVAILABLE">AVAILABLE (Open for rental bookings)</option>
                <option value="RESERVED">RESERVED (Client has booked upcoming dates)</option>
                <option value="RENTED">RENTED (Garment currently with client)</option>
                <option value="UNDER_CLEANING">UNDER CLEANING (At eco dry-cleaning)</option>
                <option value="UNAVAILABLE">UNAVAILABLE (Fitting / Maintenance / Off-cycle)</option>
              </select>
            </div>
          </div>

          {/* Optional Sale Price Section */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="allow-sale-toggle"
                checked={allowSale}
                onChange={(e) => setAllowSale(e.target.checked)}
                className="rounded text-stone-900 focus:ring-stone-500"
              />
              <label htmlFor="allow-sale-toggle" className="text-xs font-semibold uppercase tracking-wider text-stone-800 dark:text-stone-200 cursor-pointer">
                Enable Optional Purchase / Sale Price (If enabled later)
              </label>
            </div>

            {allowSale && (
              <div className="mt-3 max-w-xs pl-6">
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                  Purchase Price (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-semibold">₱</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="3500"
                    className="w-full pl-8 pr-4 py-2 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: SIZING & COLOR PALETTE */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <Layers className="w-5 h-5 text-[#a47e62] dark:text-[#dfc8b4]" />
            <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 font-medium">
              Sizing, Colors & Celebration Suitability
            </h2>
          </div>

          {/* Sizing */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Available Sizes ({sizes.length} selected)
            </label>
            
            <div className="flex flex-wrap gap-2">
              {standardSizes.map((sz) => (
                <button
                  type="button"
                  key={sz}
                  onClick={() => toggleStandardSize(sz)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sizes.includes(sz)
                      ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 font-semibold shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-sm pt-1">
              <input
                type="text"
                value={newSizeInput}
                onChange={(e) => setNewSizeInput(e.target.value)}
                onKeyDown={handleAddCustomSize}
                placeholder="Add custom size (e.g. Petite S)..."
                className="flex-1 px-3 py-1.5 rounded-lg text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              />
              <button
                type="button"
                onClick={handleAddCustomSize}
                className="px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 text-xs font-medium"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Color Palette */}
          <div className="space-y-3 pt-2 border-t border-stone-100 dark:border-stone-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              Colors & Palette
            </label>

            <div className="flex flex-wrap gap-2">
              {quickColors.map((clr) => (
                <button
                  type="button"
                  key={clr}
                  onClick={() => toggleQuickColor(clr)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    colors.includes(clr)
                      ? 'bg-[#dfc8b4] text-stone-950 font-semibold'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  {clr}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 items-center pt-2">
              {colors.map((clr) => (
                <span
                  key={clr}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900"
                >
                  <span>{clr}</span>
                  <button
                    type="button"
                    onClick={() => removeColor(clr)}
                    className="hover:opacity-75"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  onKeyDown={handleAddColor}
                  placeholder="Custom color..."
                  className="px-3 py-1 rounded-full text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 w-36"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="p-1 rounded-full bg-stone-200 dark:bg-stone-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Occasion & Internal Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-stone-100 dark:border-stone-800">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Primary Occasion Tag
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
              >
                <option value="Birthdays">Birthdays & Milestones</option>
                <option value="Debuts">Debut & Quinceañera</option>
                <option value="Weddings">Weddings & Receptions</option>
                <option value="Parties">Parties & Celebrations</option>
                <option value="Photoshoots">Photoshoots & Editorial</option>
                <option value="Formal Events">Formal & Gala Occasions</option>
                <option value="Special Occasion">Special Events</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                Owner / Atelier Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Includes custom garment bag; dry clean eco cycle only."
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: MULTI-PHOTO GALLERY & PERFORMANCE OPTIMIZER */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#a47e62] dark:text-[#dfc8b4]" />
                <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 font-medium">
                  Photoshoot Gallery ({images.length} {images.length === 1 ? 'Photo' : 'Photos'})
                </h2>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Upload multiple high-res photos. Images are automatically compressed client-side to ensure lightning-fast mobile loading.
              </p>
            </div>
          </div>

          {/* Upload & Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-stone-500 rounded-2xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center space-y-2 bg-stone-50/50 dark:bg-stone-800/20"
            >
              <Upload className="w-6 h-6 text-[#a47e62] dark:text-[#dfc8b4]" />
              <div className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                {uploadProgress ? uploadProgress : 'Click to Upload Real Dress Photos'}
              </div>
              <span className="text-[11px] text-stone-400">
                Phone camera & professional photos supported (Auto-optimized)
              </span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>

            {/* URL Input */}
            <div className="border border-stone-200 dark:border-stone-800 rounded-2xl p-6 flex flex-col justify-center space-y-3 bg-stone-50/50 dark:bg-stone-800/20">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Or Paste Image Web URL
              </span>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-wider shrink-0"
                >
                  Add URL
                </button>
              </div>
            </div>

          </div>

          {/* Current Images Gallery Grid */}
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 group shadow-sm"
                >
                  <SafeImage
                    src={img.url}
                    alt={`${name || 'Dress'} Photo ${idx + 1}`}
                    fallbackTitle={name || 'Gown Photo'}
                    className="w-full h-full object-cover"
                  />

                  {/* Primary Badge */}
                  {img.is_primary && (
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-stone-900/90 text-white backdrop-blur-md text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow">
                      <Star className="w-3 h-3 text-[#dfc8b4] fill-[#dfc8b4]" />
                      <span>Primary Photo</span>
                    </div>
                  )}

                  {/* Hover Control Overlay */}
                  <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => deleteImage(idx)}
                        className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {!img.is_primary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(idx)}
                          className="w-full py-1.5 rounded-lg bg-white/95 text-stone-900 text-[10px] font-bold uppercase tracking-wider hover:bg-white shadow"
                        >
                          Set as Primary
                        </button>
                      )}

                      <div className="flex gap-1 justify-center">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveImage(idx, 'left')}
                          className="p-1 rounded bg-stone-800 text-white disabled:opacity-30"
                          title="Move left"
                        >
                          <MoveLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === images.length - 1}
                          onClick={() => moveImage(idx, 'right')}
                          className="p-1 rounded bg-stone-800 text-white disabled:opacity-30"
                          title="Move right"
                        >
                          <MoveRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl text-stone-400 text-xs">
              No photos added yet. Upload real photoshoot images to showcase this gown to clients.
            </div>
          )}
        </div>

        {/* SECTION 5: VISIBILITY & HOMEPAGE PLACEMENT */}
        <div className="bg-white dark:bg-stone-900 p-6 sm:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <Sparkles className="w-5 h-5 text-[#a47e62] dark:text-[#dfc8b4]" />
            <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 font-medium">
              Publishing & Featured Status
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="mt-1 rounded text-stone-900 focus:ring-stone-500"
              />
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                  Published to Public Catalog
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  When enabled, this gown is visible on the customer website and available for reservations.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="mt-1 rounded text-stone-900 focus:ring-stone-500"
              />
              <div>
                <span className="block text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#dfc8b4]" />
                  <span>Featured Gown on Homepage</span>
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Showcases this gown in the curated homepage highlight section.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-800 flex-wrap">
          <Link
            to="/admin/dresses"
            className="px-6 py-3 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-medium uppercase tracking-wider text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Cancel
          </Link>

          {!isEditing && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(true)}
              className="px-6 py-3 rounded-xl border border-stone-800 dark:border-stone-200 text-stone-900 dark:text-stone-100 text-xs font-semibold uppercase tracking-wider hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              Save & Add Another
            </button>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-white shadow transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Gown to Catalog'}</span>
          </button>
        </div>

      </form>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">
                Permanently Delete Gown
              </h3>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Are you sure you want to permanently delete <strong>"{name}"</strong> ({dressCode || id})? This will immediately remove the listing and all associated photos from your catalog.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteDress}
                className="px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 shadow disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Gown'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
