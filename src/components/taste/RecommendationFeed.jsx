import { useState, useEffect, useCallback } from 'react';
import { Sparkles, Settings, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RecommendationCard from './RecommendationCard';
import TasteOnboarding from './TasteOnboarding';
import TasteSettings from './TasteSettings';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  getSessionProfile, setSessionProfile, getSessionExcludedIds,
  addSessionExcludedId, clearSessionProfile, DEFAULT_TASTE_PROFILE,
} from '@/lib/taste-utils';

/**
 * Fetches and displays personalized recommendations. Manages onboarding,
 * feedback, and settings. Falls back gracefully for anonymous visitors
 * using session-level (localStorage) preferences.
 */
export default function RecommendationFeed({ onShowSimilar }) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [error, setError] = useState(null);
  const [profileSummary, setProfileSummary] = useState(null);
  const [fullProfile, setFullProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let payload = {};
      if (!isAuthenticated) {
        const session = getSessionProfile();
        if (!session) {
          setNeedsOnboarding(true);
          setRecommendations([]);
          setLoading(false);
          return;
        }
        payload = { session_profile: session, excluded_ids: getSessionExcludedIds() };
      }
      const res = await base44.functions.invoke('getPersonalizedRecommendations', payload);
      const data = res.data || res;
      setRecommendations(data.recommendations || []);
      setNeedsOnboarding(!!data.needsOnboarding);
      setDisabled(data.personalizationEnabled === false);
      setProfileSummary(data.profile || null);
    } catch (err) {
      setError(err.message || 'Could not load recommendations.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchRecommendations(); }, [fetchRecommendations]);

  const fetchFullProfile = async () => {
    if (!isAuthenticated) {
      setFullProfile(getSessionProfile() || DEFAULT_TASTE_PROFILE);
      return;
    }
    try {
      const res = await base44.entities.PropertyTasteProfile.filter(
        { user_id: user?.id },
        { limit: 1 }
      );
      setFullProfile(res.items?.[0] || DEFAULT_TASTE_PROFILE);
    } catch {
      setFullProfile(DEFAULT_TASTE_PROFILE);
    }
  };

  const handleFeedback = async (feedbackType, property, extra = {}) => {
    try {
      if (feedbackType === 'save_for_later') {
        if (!isAuthenticated) {
          toast({ title: 'Sign in to save', description: 'Create an account to save properties.' });
          return;
        }
        await base44.functions.invoke('toggleSavedProperty', { property_id: property.id });
        toast({ title: 'Property saved', description: 'Find it in your saved properties.' });
        return;
      }

      if (feedbackType === 'not_interested' || feedbackType === 'too_expensive') {
        if (isAuthenticated) {
          await base44.functions.invoke('submitPropertyFeedback', {
            property_id: property.id, property_title: property.title, feedback_type: feedbackType,
          });
        } else {
          addSessionExcludedId(property.id);
        }
        setRecommendations((prev) => prev.filter((r) => r.property.id !== property.id));
        toast({
          title: feedbackType === 'not_interested' ? 'We\'ll hide this property' : 'Noted — too expensive',
          description: 'Your future recommendations will reflect this.',
        });
        return;
      }

      if (feedbackType === 'prefer_location' || feedbackType === 'prefer_type') {
        if (isAuthenticated) {
          await base44.functions.invoke('submitPropertyFeedback', {
            property_id: property.id, property_title: property.title,
            feedback_type: feedbackType,
            location_value: extra.location_value,
            property_type_value: extra.property_type_value,
          });
        } else {
          const session = getSessionProfile() || DEFAULT_TASTE_PROFILE;
          if (feedbackType === 'prefer_location' && extra.location_value) {
            if (!session.preferred_locations.includes(extra.location_value)) {
              session.preferred_locations = [...(session.preferred_locations || []), extra.location_value];
            }
          } else if (feedbackType === 'prefer_type' && extra.property_type_value) {
            if (!session.preferred_property_types.includes(extra.property_type_value)) {
              session.preferred_property_types = [...(session.preferred_property_types || []), extra.property_type_value];
            }
          }
          setSessionProfile(session);
        }
        const label = feedbackType === 'prefer_location' ? extra.location_value : extra.property_type_value;
        toast({
          title: 'Preference updated',
          description: `Added ${label} to your preferred ${feedbackType === 'prefer_location' ? 'locations' : 'property types'}.`,
        });
      }
    } catch (err) {
      toast({ title: 'Could not record feedback', description: err.message, variant: 'destructive' });
    }
  };

  const handleOnboardingSaved = () => {
    setShowOnboarding(false);
    fetchRecommendations();
  };

  const handleEdit = async () => {
    setShowSettings(false);
    await fetchFullProfile();
    setShowOnboarding(true);
  };

  const handleReset = () => { fetchRecommendations(); };
  const handleDisable = () => { setDisabled(true); setRecommendations([]); };
  const handleEnable = () => { setDisabled(false); fetchRecommendations(); };

  // --- Render states ---

  if (loading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-muted h-72 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (needsOnboarding) {
    return (
      <>
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-flame-500/30 bg-flame-50/50 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h2 className="font-heading text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-flame-500" />
                Personalize your property search
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Get recommendations ranked by your preferences — location, budget, property type, and more.
                Takes about a minute. You can skip this and browse normally.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => { fetchFullProfile(); setShowOnboarding(true); }}>
                Set up preferences
              </Button>
              {isAuthenticated && (
                <Button variant="ghost" onClick={async () => {
                  await base44.functions.invoke('saveTasteProfile', { action: 'skip_onboarding' });
                  setNeedsOnboarding(false);
                }}>
                  Skip
                </Button>
              )}
            </div>
          </div>
        </section>
        <TasteOnboarding
          open={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          isAuthenticated={isAuthenticated}
          onSaved={handleOnboardingSaved}
          initialProfile={fullProfile}
        />
      </>
    );
  }

  if (disabled) {
    return (
      <>
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-muted p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h2 className="font-heading text-lg font-bold">Personalization is off</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Recommendations are disabled. Enable to see properties ranked by your preferences.
              </p>
            </div>
            <Button onClick={handleEnable}>Enable</Button>
          </div>
        </section>
        <TasteSettings
          open={showSettings}
          onClose={() => setShowSettings(false)}
          profile={profileSummary}
          isAuthenticated={isAuthenticated}
          onEdit={handleEdit}
          onReset={handleReset}
          onDisable={handleDisable}
          onEnable={handleEnable}
          disabled={disabled}
        />
      </>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive flex-1">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchRecommendations}>Retry</Button>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) {
    return (
      <>
        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-muted p-5 text-center">
            <p className="text-sm text-muted-foreground">
              No properties match your preferences right now. Try adjusting your preferences or browsing the full marketplace.
            </p>
            <div className="flex justify-center gap-2 mt-3">
              <Button variant="outline" size="sm" onClick={async () => { await fetchFullProfile(); setShowOnboarding(true); }}>
                Adjust preferences
              </Button>
            </div>
          </div>
        </section>
        <TasteOnboarding
          open={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          isAuthenticated={isAuthenticated}
          onSaved={handleOnboardingSaved}
          initialProfile={fullProfile}
        />
      </>
    );
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-flame-500" />
            Recommended for you
          </h2>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={fetchRecommendations}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4" /> Settings
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <RecommendationCard
              key={rec.property.id}
              recommendation={rec}
              onFeedback={handleFeedback}
              onShowSimilar={onShowSimilar}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      </section>

      <TasteOnboarding
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        isAuthenticated={isAuthenticated}
        onSaved={handleOnboardingSaved}
        initialProfile={fullProfile}
      />
      <TasteSettings
        open={showSettings}
        onClose={() => setShowSettings(false)}
        profile={profileSummary}
        isAuthenticated={isAuthenticated}
        onEdit={handleEdit}
        onReset={handleReset}
        onDisable={handleDisable}
        onEnable={handleEnable}
        disabled={disabled}
      />
    </>
  );
}