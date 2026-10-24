import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, MapPin, Loader2, Crosshair, Map, X, TriangleAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { searchPlaces, createRequestGuard, debounce } from '@/lib/geo-service-client';
import { parseCoordinates, formatCoordinates } from '@/lib/geo-utils';

/**
 * Place / address autocomplete backed by the secure geo service.
 *
 * A visitor must pick a real result — ambiguous typed text is never silently
 * treated as a location. Coordinates typed directly are offered as an explicit
 * option, and the map-pick / current-location fallbacks are always one click
 * away when text search cannot resolve a place.
 */
export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Search a place, address, estate or landmark…',
  near,
  onUseCurrentLocation,
  onPickOnMap,
  locating = false,
  inputId = 'location-search',
  ariaLabel = 'Search for a starting location',
}) {
  const [text, setText] = useState(value?.label || '');
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlight, setHighlight] = useState(-1);
  const guardRef = useRef(null);
  if (!guardRef.current) guardRef.current = createRequestGuard();
  const wrapperRef = useRef(null);
  const listId = `${inputId}-listbox`;

  useEffect(() => {
    setText(value?.label || '');
  }, [value]);

  const runSearch = useMemo(
    () =>
      debounce(async (query) => {
        const token = guardRef.current.next();
        setLoading(true);
        setError(null);
        const result = await searchPlaces(query, { near, limit: 6 });
        if (!guardRef.current.isLatest(token)) return; // out-of-order response — drop it
        setLoading(false);
        if (!result.ok) {
          setOptions([]);
          setError(result.message);
          return;
        }
        setOptions(result.results || []);
      }, 350),
    [near?.lat, near?.lng],
  );

  useEffect(() => () => runSearch.cancel(), [runSearch]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const coordinateOption = useMemo(() => {
    const parsed = parseCoordinates(text);
    if (!parsed) return null;
    return {
      id: 'typed-coordinates',
      label: `Use coordinates ${formatCoordinates(parsed.lat, parsed.lng)}`,
      shortLabel: formatCoordinates(parsed.lat, parsed.lng),
      lat: parsed.lat,
      lng: parsed.lng,
      isCoordinate: true,
    };
  }, [text]);

  const items = useMemo(() => {
    const list = coordinateOption ? [coordinateOption] : [];
    return [...list, ...options];
  }, [coordinateOption, options]);

  const handleTextChange = (next) => {
    setText(next);
    setOpen(true);
    setHighlight(-1);
    if (next.trim().length < 2) {
      runSearch.cancel();
      setOptions([]);
      setLoading(false);
      setError(null);
      return;
    }
    runSearch(next);
  };

  const select = useCallback(
    (place) => {
      runSearch.cancel();
      setText(place.label);
      setOptions([]);
      setOpen(false);
      setHighlight(-1);
      onChange?.(place);
    },
    [onChange, runSearch],
  );

  const clear = () => {
    runSearch.cancel();
    setText('');
    setOptions([]);
    setError(null);
    setOpen(false);
    onChange?.(null);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) setOpen(true);
      setHighlight((prev) => {
        const count = items.length;
        if (count === 0) return -1;
        const next = event.key === 'ArrowDown' ? prev + 1 : prev - 1;
        return (next + count) % count;
      });
      return;
    }
    if (event.key === 'Enter') {
      if (open && highlight >= 0 && items[highlight]) {
        event.preventDefault();
        select(items[highlight]);
      }
      return;
    }
    if (event.key === 'Escape') {
      setOpen(false);
      setHighlight(-1);
    }
  };

  const showEmptyState = open && !loading && !error && items.length === 0 && text.trim().length >= 2;

  return (
    <div ref={wrapperRef} className="relative">
      <label htmlFor={inputId} className="sr-only">{ariaLabel}</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={inputId}
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        onFocus={() => text.trim().length >= 2 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="h-11 border-brand-200 bg-ice-50 pl-10 pr-16"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={highlight >= 0 ? `${listId}-option-${highlight}` : undefined}
        autoComplete="off"
      />

      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {loading && <Loader2 className="h-4 w-4 animate-spin text-flame-500" aria-label="Searching" />}
        {text && !loading && (
          <button type="button" onClick={clear} aria-label="Clear location" className="rounded p-1 text-muted-foreground hover:text-brand-900">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (loading || error || items.length > 0 || showEmptyState || onUseCurrentLocation || onPickOnMap) && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-[1200] overflow-hidden rounded-xl border border-brand-200 bg-white shadow-premium-lg">
          <ul id={listId} role="listbox" aria-label="Location suggestions" className="max-h-64 overflow-y-auto py-1">
            {items.map((item, index) => (
              <li key={item.id} id={`${listId}-option-${index}`} role="option" aria-selected={highlight === index}>
                <button
                  type="button"
                  onMouseEnter={() => setHighlight(index)}
                  onClick={() => select(item)}
                  className={`flex w-full items-start gap-2.5 px-3 py-2 text-left transition ${highlight === index ? 'bg-flame-50' : 'hover:bg-ice-50'}`}
                >
                  <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${item.isCoordinate ? 'text-info' : 'text-flame-500'}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-brand-900">{item.shortLabel || item.label}</span>
                    {item.label !== item.shortLabel && (
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.label}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}

            {showEmptyState && (
              <li className="px-3 py-3 text-sm text-muted-foreground">
                No place matched “{text.trim()}”. Check the spelling, or pick the exact point on the map.
              </li>
            )}

            {error && (
              <li className="flex items-start gap-2 px-3 py-3 text-sm text-amber-700">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </li>
            )}
          </ul>

          {(onUseCurrentLocation || onPickOnMap) && (
            <div className="flex flex-col gap-1 border-t border-brand-100 bg-ice-50 p-2 sm:flex-row">
              {onUseCurrentLocation && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onUseCurrentLocation();
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-brand-900 hover:bg-brand-50"
                >
                  {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Crosshair className="h-3.5 w-3.5 text-flame-500" />}
                  Use my current location
                </button>
              )}
              {onPickOnMap && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onPickOnMap();
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-brand-900 hover:bg-brand-50"
                >
                  <Map className="h-3.5 w-3.5 text-info" />
                  Pick the point on the map
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}