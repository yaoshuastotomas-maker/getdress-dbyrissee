import React, { useEffect, useState } from 'react';
import { History, Filter, RotateCcw, Clock, User, FileText, Tag } from 'lucide-react';
import { ActivityHistoryItem } from '../../types';
import { api } from '../../services/api';

export const AdminHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<ActivityHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    api.history
      .list({ limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        setHistory(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load history:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredHistory = history.filter((item) => {
    if (actionFilter !== 'ALL' && item.action !== actionFilter) return false;
    if (entityFilter !== 'ALL' && item.entity_type !== entityFilter) return false;
    return true;
  });

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
    if (action.includes('ARCHIVE')) return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    if (action.includes('RESTORE')) return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300';
    if (action.includes('DELETE')) return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
    return 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200';
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Title */}
      <div>
        <h1 className="font-serif text-3xl font-normal text-stone-900 dark:text-stone-100">
          Activity & Audit Log
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Complete, chronological record of all administrative operations, dress creations, inventory changes, and settings updates.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center gap-4 flex-wrap shadow-sm">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Action:
          </span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:outline-none"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE_DRESS">CREATE_DRESS</option>
            <option value="UPDATE_DRESS">UPDATE_DRESS</option>
            <option value="DUPLICATE_DRESS">DUPLICATE_DRESS</option>
            <option value="ARCHIVE_DRESS">ARCHIVE_DRESS</option>
            <option value="RESTORE_DRESS">RESTORE_DRESS</option>
            <option value="DELETE_DRESS">DELETE_DRESS</option>
            <option value="CREATE_CATEGORY">CREATE_CATEGORY</option>
            <option value="UPDATE_CATEGORY">UPDATE_CATEGORY</option>
            <option value="DELETE_CATEGORY">DELETE_CATEGORY</option>
            <option value="UPDATE_SETTINGS">UPDATE_SETTINGS</option>
            <option value="UPDATE_INQUIRY">UPDATE_INQUIRY</option>
            <option value="SYSTEM_INIT">SYSTEM_INIT</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Entity:
          </span>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs focus:outline-none"
          >
            <option value="ALL">All Entities</option>
            <option value="dress">Dress</option>
            <option value="category">Category</option>
            <option value="inquiry">Inquiry</option>
            <option value="settings">Settings</option>
            <option value="system">System</option>
          </select>
        </div>

        {(actionFilter !== 'ALL' || entityFilter !== 'ALL') && (
          <button
            onClick={() => {
              setActionFilter('ALL');
              setEntityFilter('ALL');
            }}
            className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* History Log Timeline / Table */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-800/40 text-stone-500 dark:text-stone-400 font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-6">Timestamp</th>
              <th className="py-3.5 px-6">Action</th>
              <th className="py-3.5 px-6">Entity</th>
              <th className="py-3.5 px-6">Activity Description</th>
              <th className="py-3.5 px-6">Actor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-stone-400 animate-pulse">
                  Loading activity logs...
                </td>
              </tr>
            ) : filteredHistory.length > 0 ? (
              filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                  <td className="py-4 px-6 text-stone-500 dark:text-stone-400 font-mono text-[11px] whitespace-nowrap">
                    {new Date(item.created_at).toLocaleString()}
                  </td>

                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${getActionColor(item.action)}`}>
                      {item.action}
                    </span>
                  </td>

                  <td className="py-4 px-6 font-medium text-stone-700 dark:text-stone-300 uppercase tracking-wider text-[10px]">
                    {item.entity_type}
                  </td>

                  <td className="py-4 px-6 text-stone-900 dark:text-stone-100 font-normal">
                    {item.description}
                  </td>

                  <td className="py-4 px-6 text-stone-500 dark:text-stone-400 whitespace-nowrap">
                    {item.user_responsible}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-stone-400">
                  No activity log entries found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
