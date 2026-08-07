import React from "react";
import { Plus, X, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { youtubeThumb } from "./youtubeUtils";

/**
 * Manage a list of YouTube video URLs.
 * `value` is a string[] of raw URLs; onChange(string[]).
 */
export default function YoutubeLinksInput({ value = [], onChange }) {
  const add = () => onChange([...value, ""]);
  const update = (i, v) => onChange(value.map((x, idx) => (idx === i ? v : x)));
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {value.map((url, i) => {
        const thumb = youtubeThumb(url);
        return (
          <div key={i} className="flex items-center gap-2">
            <div className="h-10 w-16 shrink-0 overflow-hidden rounded bg-muted">
              {thumb ? (
                <img src={thumb} alt="thumb" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Youtube className="h-4 w-4" />
                </div>
              )}
            </div>
            <Input
              value={url}
              onChange={(e) => update(i, e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="inline-flex h-8 w-8 items-center justify-center rounded text-destructive hover:bg-destructive/10"
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="mr-1 h-4 w-4" /> Add YouTube link
      </Button>
    </div>
  );
}