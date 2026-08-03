import { useState, useEffect } from 'react';
import { Clock, Trash2, TrendingUp } from 'lucide-react';
import { getSearchHistory, clearSearchHistory, TRENDING_SEARCHES } from '@/lib/search-utils';

export default function SearchHistory({ onSearch }) {
  const [history, setHistory] = useState([]);

  useEffect(() => { setHistory(getSearchHistory()); }, []);

  const handleClear = () => { clearSearchHistory(); setHistory([]); };

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
        <h3 className="flex items-center gap-2 font-heading text-base font-bold text-brand-900"><TrendingUp className="h-4 w-4 text-flame-500" /> Trending Searches</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {TRENDING_SEARCHES.slice(0, 6).map((t) => (
            <button key={t} onClick={() => onSearch(t)} className="rounded-full border border-brand-200 bg-ice-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:border-flame-300 hover:bg-flame-50 hover:text-flame-600">
              {t}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-heading text-base font-bold text-brand-900"><Clock className="h-4 w-4 text-flame-500" /> Recent Searches</h3>
        <button onClick={handleClear} className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-error">
          <Trash2 className="h-3 w-3" /> Clear
        </button>
      </div>
      <div className="mt-3 space-y-1">
        {history.map((h, i) => (
          <button key={i} onClick={() => onSearch(h)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-brand-700 hover:bg-ice-50">
            <Clock className="h-3.5 w-3.5 text-brand-300" />
            <span className="flex-1 truncate">{h}</span>
          </button>
        ))}
      </div>
    </div>
  );
}