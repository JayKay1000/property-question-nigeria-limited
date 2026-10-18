/**
 * Saved Search Alert Engine — shared matching and delivery logic.
 * Used by the evaluateSavedSearchAlerts backend function.
 *
 * CANONICAL SEARCH CONTRACT:
 *   Replicates buildMarketplaceQuery from src/lib/marketplace-search.js
 *   so the backend evaluates saved criteria against the exact same
 *   public-listing query the marketplace uses for discovery.
 */

export const ACTIVE_STATUSES = ['published', 'active', 'approved', 'verified'];
const UNAVAILABLE_STATUSES = ['sold', 'leased', 'withdrawn', 'archived'];

export function normalizeKeyword(keyword) {
  if (!keyword) return '';
  return String(keyword).trim().slice(0, 200);
}

/**
 * Builds the server-side query for public marketplace properties.
 * Replicated from src/lib/marketplace-search.js — canonical search contract.
 * Only public, active listings are included.
 */
export function buildMarketplaceQuery(filters) {
  const f = filters || {};
  const query = { visibility: 'public', status: { $in: ACTIVE_STATUSES } };
  const kw = normalizeKeyword(f.keyword);

  if (f.purpose) query.listing_purpose = f.purpose;
  if (f.propertyType) query.property_type = f.propertyType;
  if (f.state) query.state = f.state;
  if (f.lga) query.lga = f.lga;

  if (f.priceMin != null || f.priceMax != null) {
    query.price = {};
    if (f.priceMin != null) query.price.$gte = f.priceMin;
    if (f.priceMax != null) query.price.$lte = f.priceMax;
  }

  if (f.bedrooms) query.bedrooms = { $gte: f.bedrooms };
  if (f.bathrooms) query.bathrooms = { $gte: f.bathrooms };
  if (f.classification) query.property_classification = f.classification;
  if (f.featured) query.is_featured = true;
  if (f.jointVenture) query.is_joint_venture = true;
  if (f.amenities && f.amenities.length) query.amenities = { $all: f.amenities };

  if (kw) {
    query.$or = [
      { title: { $regex: kw, $options: 'i' } },
      { reference_number: { $regex: kw, $options: 'i' } },
      { city: { $regex: kw, $options: 'i' } },
      { estate: { $regex: kw, $options: 'i' } },
    ];
  }

  return query;
}

export function buildPropertySnapshot(p) {
  return {
    id: p.id,
    title: p.title || p.property_title || 'Untitled',
    price: p.price,
    state: p.state,
    city: p.city,
    lga: p.lga,
    listing_purpose: p.listing_purpose,
    property_type: p.property_type,
    featured_image_url: p.featured_image_url || (p.image_urls && p.image_urls[0]),
  };
}

function formatPrice(price) {
  if (price == null) return 'Price on request';
  return '\u20A6' + Number(price).toLocaleString('en-NG');
}

function formatAlertTitle(alertType, snap) {
  const labels = {
    new_listing: 'New match: ' + snap.title,
    price_reduction: 'Price drop: ' + snap.title,
    availability_change: 'Availability update: ' + snap.title,
    material_update: 'Listing updated: ' + snap.title,
    listing_unavailable: 'No longer available: ' + snap.title,
    status_change: 'Status change: ' + snap.title,
  };
  return labels[alertType] || 'Alert: ' + snap.title;
}

function formatAlertMessage(alertType, snap, extra) {
  const location = [snap.city, snap.state].filter(Boolean).join(', ');
  const priceStr = formatPrice(snap.price);
  const base = snap.title + (location ? ' - ' + location : '') + ' - ' + priceStr;
  const messages = {
    new_listing: 'A new property matching your saved search just hit the market: ' + base,
    price_reduction: 'A property matching your saved search had a price reduction: ' + base + (extra && extra.oldPrice ? ' (was ' + formatPrice(extra.oldPrice) + ')' : ''),
    availability_change: 'Availability changed for a property matching your saved search: ' + base + (extra && extra.statusNote ? ' - ' + extra.statusNote : ''),
    material_update: 'A property matching your saved search was updated: ' + base,
    listing_unavailable: 'A property matching your saved search is no longer available: ' + base + (extra && extra.statusNote ? ' - ' + extra.statusNote : ''),
    status_change: 'Status changed for a property matching your saved search: ' + base + (extra && extra.statusNote ? ' - ' + extra.statusNote : ''),
  };
  return messages[alertType] || base;
}

function buildAlertEmailHtml(title, message, propertyId) {
  return '<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fbfaf9">' +
    '<div style="background:#001b3d;padding:24px 36px"><h2 style="color:#fff;margin:0;font-size:18px">Property Question</h2></div>' +
    '<div style="padding:36px;background:#fff">' +
    '<h3 style="color:#001b3d;margin:0 0 12px">' + title + '</h3>' +
    '<p style="color:#5c6370;font-size:14px;line-height:1.6">' + message + '</p>' +
    '<a href="https://propertyquestion.base44.app/properties/' + propertyId + '" style="display:inline-block;background:#001b3d;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;margin-top:16px">View Listing</a>' +
    '<p style="color:#5c6370;font-size:12px;margin-top:24px">You received this alert because you saved a search on Property Question. Manage your alerts in your saved searches panel.</p>' +
    '</div></div>';
}

/**
 * Determines if a search should be evaluated on this scheduler run
 * based on its alert frequency setting.
 */
export function shouldEvaluateSearch(search, now) {
  if (!search.alerts_enabled) return false;
  const freq = search.alert_frequency || 'immediate';
  if (freq === 'immediate') return true;

  const lastDigest = search.last_digest_sent_at ? new Date(search.last_digest_sent_at) : null;
  if (freq === 'daily_digest') {
    if (!lastDigest) return true;
    return (now.getTime() - lastDigest.getTime()) >= 20 * 60 * 60 * 1000;
  }
  if (freq === 'weekly_digest') {
    if (!lastDigest) return true;
    return (now.getTime() - lastDigest.getTime()) >= 6 * 24 * 60 * 60 * 1000;
  }
  return true;
}

export function isDigestFrequency(search) {
  return search.alert_frequency === 'daily_digest' || search.alert_frequency === 'weekly_digest';
}

/**
 * Core evaluation: finds alert-worthy events for a single saved search
 * and delivers alerts through the configured channels.
 *
 * @param adminBase44 - service-role SDK client
 * @param search - enriched SavedSearch record (with user_email and user_pref)
 * @param since - ISO timestamp of last evaluation (baseline)
 * @param now - current Date
 * @returns { sent, failed, skipped } stats
 */
export async function evaluateSearch(adminBase44, search, since, now) {
  const stats = { sent: 0, failed: 0, skipped: 0 };
  const alertTypes = search.alert_types || ['new_listing'];
  const channels = search.alert_channels || ['in_app'];
  const sinceDate = new Date(since);

  // 1. Get all properties matching the saved filters (canonical query)
  const { items: matchingProperties } = await adminBase44.entities.Property.filter(
    buildMarketplaceQuery(search.filters),
    {
      sort: '-created_date',
      limit: 500,
      fields: ['id', 'title', 'property_title', 'price', 'state', 'city', 'lga',
        'listing_purpose', 'property_type', 'featured_image_url', 'image_urls',
        'created_date', 'updated_date', 'status', 'availability_status']
    }
  );

  if (matchingProperties.length === 0) return stats;

  const matchingMap = new Map(matchingProperties.map(function (p) { return [p.id, p]; }));
  const matchingIds = Array.from(matchingMap.keys());

  // 2. Get existing alert logs for this search (dedup — one query)
  const { items: existingLogs } = await adminBase44.entities.SearchAlertLog.filter(
    { saved_search_id: search.id },
    { sort: '-created_date', limit: 1000, fields: ['property_id', 'alert_type', 'event_reference'] }
  );
  const alertedKeys = new Set(existingLogs.map(function (log) {
    return log.property_id + ':' + log.alert_type + ':' + (log.event_reference || '');
  }));
  function isAlerted(propertyId, alertType, eventRef) {
    return alertedKeys.has(propertyId + ':' + alertType + ':' + (eventRef || ''));
  }

  const alerts = [];

  // 3. New listings: created since baseline
  if (alertTypes.includes('new_listing')) {
    for (const p of matchingProperties) {
      if (new Date(p.created_date) >= sinceDate) {
        if (!isAlerted(p.id, 'new_listing', p.id)) {
          alerts.push({ property: p, alertType: 'new_listing', eventRef: p.id });
        }
      }
    }
  }

  // 4. Material updates: updated since baseline, but not newly created
  if (alertTypes.includes('material_update')) {
    for (const p of matchingProperties) {
      const created = new Date(p.created_date);
      const updated = new Date(p.updated_date);
      if (updated >= sinceDate && created < sinceDate) {
        if (!isAlerted(p.id, 'material_update', p.id) && !isAlerted(p.id, 'new_listing', p.id)) {
          alerts.push({ property: p, alertType: 'material_update', eventRef: p.id });
        }
      }
    }
  }

  // 5. Price reductions: PropertyPricing records with reliable previous > current
  if (alertTypes.includes('price_reduction') && matchingIds.length > 0) {
    const { items: pricingChanges } = await adminBase44.entities.PropertyPricing.filter(
      { property_id: { $in: matchingIds }, created_date: { $gte: since } },
      { sort: '-created_date', limit: 200, fields: ['id', 'property_id', 'current_price', 'previous_price', 'discount_amount'] }
    );
    for (const pr of pricingChanges) {
      // Reliable check: both prices exist, previous > current, current > 0
      if (pr.previous_price != null && pr.current_price != null &&
          pr.previous_price > pr.current_price && pr.current_price > 0) {
        const prop = matchingMap.get(pr.property_id);
        if (prop && !isAlerted(pr.property_id, 'price_reduction', pr.id)) {
          alerts.push({
            property: prop,
            alertType: 'price_reduction',
            eventRef: pr.id,
            extra: { oldPrice: pr.previous_price, newPrice: pr.current_price }
          });
        }
      }
    }
  }

  // 6. Status changes: PropertyStatusHistory records since baseline
  const wantsStatus = alertTypes.includes('availability_change') ||
                      alertTypes.includes('listing_unavailable') ||
                      alertTypes.includes('status_change');
  if (wantsStatus && matchingIds.length > 0) {
    const { items: statusChanges } = await adminBase44.entities.PropertyStatusHistory.filter(
      { property_id: { $in: matchingIds }, created_date: { $gte: since } },
      { sort: '-created_date', limit: 200, fields: ['id', 'property_id', 'status', 'previous_status', 'reason'] }
    );
    for (const sc of statusChanges) {
      const prop = matchingMap.get(sc.property_id);
      if (!prop) continue;

      let alertType = null;
      const statusNote = 'Status: ' + (sc.previous_status || '\u2014') + ' \u2192 ' + sc.status;

      if (UNAVAILABLE_STATUSES.includes(sc.status)) {
        if (alertTypes.includes('listing_unavailable')) alertType = 'listing_unavailable';
        else if (alertTypes.includes('availability_change')) alertType = 'availability_change';
      } else if (sc.status === 'reserved' || sc.status === 'under_offer') {
        if (alertTypes.includes('availability_change')) alertType = 'availability_change';
        else if (alertTypes.includes('status_change')) alertType = 'status_change';
      } else {
        if (alertTypes.includes('status_change')) alertType = 'status_change';
      }

      if (alertType && !isAlerted(sc.property_id, alertType, sc.id)) {
        alerts.push({ property: prop, alertType: alertType, eventRef: sc.id, extra: { statusNote: statusNote } });
      }
    }
  }

  // Limit alerts per run to prevent flooding
  const maxAlerts = isDigestFrequency(search) ? 50 : 20;
  const alertsToSend = alerts.slice(0, maxAlerts);
  stats.skipped = alerts.length - alertsToSend.length;

  // 7. Deliver alerts
  for (const alert of alertsToSend) {
    try {
      const result = await deliverAlert(adminBase44, search, alert, channels);
      if (result.sent) stats.sent++;
      else if (result.failed) stats.failed++;
    } catch (e) {
      stats.failed++;
    }
  }

  return stats;
}

async function deliverAlert(adminBase44, search, alert, channels) {
  const p = alert.property;
  const alertType = alert.alertType;
  const eventRef = alert.eventRef;
  const extra = alert.extra;

  const snap = buildPropertySnapshot(p);
  const title = formatAlertTitle(alertType, snap);
  const message = formatAlertMessage(alertType, snap, extra);
  const actionUrl = '/properties/' + p.id;

  // Check user notification preferences
  const pref = search.user_pref || {};
  const inAppEnabled = pref.channel_in_app_enabled !== false;
  const emailEnabled = pref.channel_email_enabled !== false && pref.category_property_email !== false;

  const effectiveChannels = channels.filter(function (ch) {
    if (ch === 'in_app') return inAppEnabled;
    if (ch === 'email') return emailEnabled;
    return false;
  });

  let notificationId = null;
  let emailSent = false;
  let deliveryStatus = 'sent';
  let errorMessage = null;

  if (effectiveChannels.length === 0) {
    // User opted out of all configured channels — log to prevent re-alerting
    deliveryStatus = 'suppressed';
    errorMessage = 'All channels opted out';
  } else {
    // In-app notification
    if (effectiveChannels.includes('in_app')) {
      try {
        const notif = await adminBase44.entities.Notification.create({
          recipient_id: search.user_id,
          notification_type: 'in_app',
          category: 'property',
          priority: alertType === 'listing_unavailable' ? 'high' : 'normal',
          title: title,
          message: message,
          action_url: actionUrl,
          action_label: 'View listing',
          delivery_status: 'sent',
          related_entity_type: 'Property',
          related_entity_id: p.id,
        });
        notificationId = notif.id;
      } catch (e) {
        deliveryStatus = 'failed';
        errorMessage = 'In-app failed: ' + e.message;
      }
    }

    // Email notification
    if (effectiveChannels.includes('email') && search.user_email) {
      try {
        await adminBase44.integrations.Core.SendEmail({
          to: search.user_email,
          subject: title,
          html: buildAlertEmailHtml(title, message, p.id),
        });
        emailSent = true;
      } catch (e) {
        if (deliveryStatus !== 'failed') {
          errorMessage = 'Email failed: ' + e.message;
        }
      }
    }
  }

  // Create alert log for dedup (prevents re-alerting the same event)
  try {
    await adminBase44.entities.SearchAlertLog.create({
      saved_search_id: search.id,
      user_id: search.user_id,
      property_id: p.id,
      alert_type: alertType,
      event_reference: eventRef,
      property_snapshot: snap,
      delivery_status: deliveryStatus,
      notification_id: notificationId,
      email_sent: emailSent,
      error_message: errorMessage,
      alerted_at: new Date().toISOString(),
    });
  } catch (e) {
    // Non-critical — if we can't log, we might re-alert next time
  }

  return { sent: deliveryStatus === 'sent', failed: deliveryStatus === 'failed' };
}