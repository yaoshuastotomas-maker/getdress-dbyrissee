import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Tag, AlertTriangle, Layers, X, Check } from 'lucide-react';
import { Category } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const AdminCategoriesPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Create Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirm modal state
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);

  const loadCategories = () => {
    setLoading(true);
    api.categories
      .list()
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        toastError('Failed to load categories: ' + err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setDisplayOrder(categories.length);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setDisplayOrder(cat.display_order || 0);
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    const payload = {
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description.trim(),
      display_order: Number(displayOrder),
    };

    try {
      if (editingCategory) {
        await api.categories.update(editingCategory.id, payload);
        success(`Category "${name}" updated.`);
      } else {
        await api.categories.create(payload);
        success(`Category "${name}" created.`);
      }
      setModalOpen(false);
      loadCategories();
    } catch (err: any) {
      toastError(err.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    try {
      await api.categories.delete(cat.id);
      success(`Category "${cat.name}" deleted.`);
      setDeleteConfirm(null);
      loadCategories();
    } catch (err: any) {
      toastError(err.message || 'Cannot delete category');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-normal text-stone-900 dark:text-stone-100">
            Collections & Categories
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Group your gowns by occasion, silhouette, or seasonal collection.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-white shadow transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Collection</span>
        </button>
      </div>

      {/* Categories Table / Card Grid */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-500 dark:text-stone-400 font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-6">Collection Name</th>
              <th className="py-3.5 px-6">URL Slug</th>
              <th className="py-3.5 px-6">Description</th>
              <th className="py-3.5 px-6">Assigned Gowns</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-stone-400 animate-pulse">
                  Loading collections...
                </td>
              </tr>
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                  <td className="py-4 px-6 font-medium text-stone-900 dark:text-stone-100">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#dfc8b4]" />
                      <span>{cat.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-[11px] text-stone-500 dark:text-stone-400">
                    {cat.slug}
                  </td>
                  <td className="py-4 px-6 text-stone-600 dark:text-stone-300 max-w-xs truncate">
                    {cat.description || '—'}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                      <Layers className="w-3 h-3 text-[#dfc8b4]" />
                      <span>{cat.dress_count || 0} dresses</span>
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
                        title="Edit collection"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(cat)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                        title="Delete collection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-stone-400">
                  No collections defined yet. Click "+ Add Collection" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h2 className="font-serif text-2xl font-normal text-stone-900 dark:text-stone-100">
                {editingCategory ? 'Edit Collection' : 'Create New Collection'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  Collection Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Red Carpet Showstoppers"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="red-carpet-showstoppers"
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-mono text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Atmospheric gowns designed for high-profile galas, premieres, and ceremonies..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-white shadow"
                >
                  {submitting ? 'Saving...' : 'Save Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-100">
                Delete Collection
              </h3>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Are you sure you want to delete <strong>"{deleteConfirm.name}"</strong>?
              {deleteConfirm.dress_count && deleteConfirm.dress_count > 0 ? (
                <span className="block mt-2 text-rose-600 font-semibold">
                  Warning: There are {deleteConfirm.dress_count} active gowns assigned to this collection. Please reassign those dresses first before deleting.
                </span>
              ) : null}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 shadow"
              >
                Delete Collection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
