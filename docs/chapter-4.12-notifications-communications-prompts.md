# Chapter 4.12 — Notifications & Communications: Base44 Build Prompts

> **Mission:** Design and build an Enterprise Notifications & Communications Module for a premium PropTech platform in Nigeria. The module must deliver real-time in-app notifications, transactional email, SMS (with NDPR-compliant DND management), push notifications, WhatsApp Business messaging, bulk campaign management, reusable template engineering, user preference controls, and a centralized admin console for delivery analytics and audit compliance.

---

## Prompt 1 — Entity Schema Engineering (Database Layer)

### 1.1 Core Notification Entities

**Prompt:**
> Create the following entity schemas in `base44/entities/`. Each entity must follow the platform's JSON schema conventions (no placeholders, full schemas, built-in fields `id`, `created_date`, `updated_date`, `created_by_id` are implicit). Apply appropriate Row-Level Security (RLS) policies so that: admin-only entities restrict create/update/delete to `role: admin`; user-facing entities allow the owner (`created_by_id: "{{user.id}}"`) to read and update their own records; read access for lookup entities is public (null).

**Entity: NotificationTemplate**
```
- template_code (string, unique identifier, e.g. "welcome_email", "inspection_reminder_sms")
- template_name (string, display name)
- description (string)
- category (enum: transactional, marketing, system, alert, reminder, verification, crm, property, project, payment, account)
- channel (enum: email, sms, push, in_app, whatsapp, multi_channel)
- subject_template (string, for email channel — supports {{variable}} placeholders)
- body_template (string, rich text/HTML for email, plain text for SMS/WhatsApp, JSON for push/in-app)
- placeholder_schema (object, JSON schema describing available variables and their types)
- language (string, default "en", ISO 639-1)
- fallback_template_id (string, reference to fallback template if rendering fails)
- is_active (boolean, default true)
- version (number, default 1, increments on edit)
- trigger_event (string, the system event that auto-fires this template, e.g. "lead_created", "inspection_scheduled")
- priority (enum: low, normal, high, urgent, default normal)
- sort_order (number, default 0)
```

**Entity: NotificationLog**
```
- notification_reference (string, unique reference, e.g. "NTF-2026-000001")
- recipient_user_id (string, reference to User)
- recipient_email (string)
- recipient_phone (string)
- recipient_name (string)
- template_id (string, reference to NotificationTemplate)
- template_code (string, denormalized for audit)
- channel (enum: email, sms, push, in_app, whatsapp)
- subject (string, rendered subject)
- body (string, rendered body)
- status (enum: queued, sent, delivered, read, failed, bounced, suppressed, cancelled, default queued)
- priority (enum: low, normal, high, urgent, default normal)
- source_entity (string, the entity that triggered the notification, e.g. "Lead", "InspectionRequest")
- source_entity_id (string, the record ID that triggered the notification)
- source_event (string, the event name, e.g. "created", "updated", "reminder")
- related_property_id (string, optional link to Property)
- related_project_id (string, optional link to Project)
- related_lead_id (string, optional link to Lead)
- metadata (object, additional context variables used in rendering)
- scheduled_at (date-time, when the notification is scheduled to send)
- sent_at (date-time, when dispatched to provider)
- delivered_at (date-time, when provider confirmed delivery)
- read_at (date-time, when user opened/read the notification)
- failed_reason (string, error message if status is failed/bounced)
- retry_count (number, default 0)
- provider_message_id (string, ID returned by the sending provider)
- is_read (boolean, default false)
- is_archived (boolean, default false)
- action_url (string, deep-link URL for in-app notifications)
- action_label (string, CTA button label)
- icon (string, lucide icon name for in-app display)
- category (enum: transactional, marketing, system, alert, reminder, verification, crm, property, project, payment, account)
```

**Entity: NotificationPreference**
```
- user_id (string, reference to User)
- channel_email_enabled (boolean, default true)
- channel_sms_enabled (boolean, default true)
- channel_push_enabled (boolean, default true)
- channel_in_app_enabled (boolean, default true)
- channel_whatsapp_enabled (boolean, default false)
- category_transactional_email (boolean, default true) — transactional emails are mandatory but user can mute non-critical
- category_transactional_sms (boolean, default true)
- category_marketing_email (boolean, default false) — opt-in required
- category_marketing_sms (boolean, default false) — opt-in required, NDPR compliant
- category_system_email (boolean, default true)
- category_system_sms (boolean, default false)
- category_alert_email (boolean, default true)
- category_alert_sms (boolean, default true)
- category_reminder_email (boolean, default true)
- category_reminder_sms (boolean, default true)
- category_crm_email (boolean, default true)
- category_crm_sms (boolean, default false)
- category_property_email (boolean, default true)
- category_project_email (boolean, default true)
- category_payment_email (boolean, default true)
- category_payment_sms (boolean, default true)
- category_account_email (boolean, default true)
- category_account_sms (boolean, default true)
- digest_enabled (boolean, default false) — batch notifications into digest
- digest_frequency (enum: hourly, daily, weekly, default daily)
- digest_time (string, HH:MM format, default "08:00")
- quiet_hours_enabled (boolean, default false)
- quiet_hours_start (string, HH:MM, default "22:00")
- quiet_hours_end (string, HH:MM, default "07:00")
- quiet_hours_channel (enum: all, sms, push, default push)
- language (string, default "en")
- timezone (string, default "Africa/Lagos")
```

### 1.2 Communication Campaign Entities

**Entity: CommunicationCampaign**
```
- campaign_reference (string, unique, e.g. "CMP-2026-0001")
- campaign_name (string)
- description (string)
- campaign_type (enum: email, sms, push, whatsapp, multi_channel)
- category (enum: marketing, announcement, newsletter, promotional, event, alert, re_engagement)
- status (enum: draft, scheduled, sending, sent, paused, cancelled, failed, default draft)
- template_id (string, reference to NotificationTemplate)
- subject_override (string, optional subject override)
- body_override (string, optional body override)
- audience_type (enum: all_users, segment, filtered, manual_list, role_based, entity_based)
- audience_filter (object, MongoDB-style filter for audience selection)
- audience_count (number, total recipients resolved)
- sent_count (number, default 0)
- delivered_count (number, default 0)
- read_count (number, default 0)
- failed_count (number, default 0)
- bounced_count (number, default 0)
- opted_out_count (number, default 0)
- scheduled_at (date-time)
- started_at (date-time)
- completed_at (date-time)
- channels (array of strings, e.g. ["email", "sms"])
- priority (enum: low, normal, high, urgent, default normal)
- owner_id (string, reference to User who created the campaign)
- owner_name (string)
- metadata (object)
- is_recurring (boolean, default false)
- recurrence_pattern (string, cron expression)
- next_run_at (date-time)
- tags (array of strings)
- sort_order (number, default 0)
- is_active (boolean, default true)
```

**Entity: CampaignRecipient**
```
- campaign_id (string, reference to CommunicationCampaign)
- campaign_reference (string, denormalized)
- recipient_user_id (string, reference to User)
- recipient_email (string)
- recipient_phone (string)
- recipient_name (string)
- channel (enum: email, sms, push, whatsapp)
- status (enum: pending, queued, sent, delivered, read, failed, bounced, opted_out, default pending)
- notification_log_id (string, reference to NotificationLog)
- sent_at (date-time)
- delivered_at (date-time)
- read_at (date-time)
- failed_reason (string)
- metadata (object)
- is_suppressed (boolean, default false) — suppressed due to DND or opt-out
```

### 1.3 DND & Compliance Entities

**Entity: DNDPreference**
```
- phone_number (string, unique, the phone number registered on DND)
- dnd_status (enum: full_dnd, partial_dnd, not_registered, unknown, default unknown)
- partial_categories (array of strings, if partial: which categories are blocked, e.g. ["marketing", "promotional"])
- source (enum: user_request, system_check, provider_sync, admin_override)
- verified_at (date-time, when the DND status was last verified)
- provider_reference (string, reference from telecom provider DND check)
- can_receive_marketing (boolean, default false)
- can_receive_transactional (boolean, default true)
- opt_in_date (date-time)
- opt_out_date (date-time)
- notes (string)
- is_active (boolean, default true)
```

**Entity: CommunicationProvider**
```
- provider_code (string, unique, e.g. "sendemail", "twilio_sms", "firebase_push", "whatsapp_business")
- provider_name (string, display name)
- provider_type (enum: email, sms, push, whatsapp, multi_channel)
- is_active (boolean, default true)
- is_primary (boolean, default false) — primary provider for this channel type
- fallback_provider_id (string, reference to fallback provider)
- api_endpoint (string, base API URL)
- supported_features (array of strings, e.g. ["delivery_receipts", "webhooks", "templates", "scheduling"])
- rate_limit_per_minute (number)
- rate_limit_per_hour (number)
- daily_quota (number)
- daily_used (number, default 0)
- monthly_quota (number)
- monthly_used (number, default 0)
- cost_per_unit_ngn (number)
- config_metadata (object, non-secret configuration like region, sender ID)
- secret_key_name (string, name of the secret in Base44 secrets vault)
- webhook_url (string, inbound webhook URL for delivery receipts)
- last_health_check (date-time)
- health_status (enum: healthy, degraded, down, unknown, default unknown)
- sort_order (number, default 0)
```

### 1.4 Messaging & Thread Entities

**Entity: CommunicationThread**
```
- thread_reference (string, unique, e.g. "THR-2026-0001")
- thread_type (enum: lead, customer, agent, property_enquiry, project_enquiry, support, general)
- subject (string)
- participant_user_ids (array of strings, User IDs in the thread)
- participant_emails (array of strings)
- participant_phones (array of strings)
- related_entity_type (string, e.g. "Lead", "Property", "Project")
- related_entity_id (string)
- related_entity_name (string, denormalized name)
- channel (enum: in_app, email, sms, whatsapp, mixed)
- status (enum: active, awaiting_response, resolved, closed, archived, default active)
- priority (enum: low, normal, high, urgent, default normal)
- assigned_to_id (string, reference to User — staff assigned to thread)
- assigned_to_name (string)
- last_message_at (date-time)
- last_message_direction (enum: inbound, outbound)
- last_message_preview (string, truncated preview of last message)
- unread_count (number, default 0) — unread messages in thread
- total_messages (number, default 0)
- first_message_at (date-time)
- closed_at (date-time)
- resolution_notes (string)
- tags (array of strings)
- metadata (object)
- is_pinned (boolean, default false)
- is_starred (boolean, default false)
```

**Entity: CommunicationMessage**
```
- thread_id (string, reference to CommunicationThread)
- thread_reference (string, denormalized)
- direction (enum: inbound, outbound)
- channel (enum: in_app, email, sms, whatsapp, push)
- sender_user_id (string, reference to User — for outbound, the staff who sent it)
- sender_name (string)
- sender_email (string)
- sender_phone (string)
- recipient_user_id (string, reference to User)
- recipient_name (string)
- recipient_email (string)
- recipient_phone (string)
- subject (string)
- body (string, message body — supports plain text and rich text)
- body_format (enum: plain, html, markdown, default plain)
- attachments (array of objects — file URLs and metadata)
- status (enum: draft, queued, sent, delivered, read, failed, bounced, default sent)
- priority (enum: low, normal, high, urgent, default normal)
- source (enum: manual, automated, campaign, template, workflow, default manual)
- template_id (string, reference to NotificationTemplate if template-driven)
- campaign_id (string, reference to CommunicationCampaign if campaign-driven)
- notification_log_id (string, reference to NotificationLog)
- in_reply_to_id (string, reference to parent CommunicationMessage for threading)
- sent_at (date-time)
- delivered_at (date-time)
- read_at (date-time)
- failed_reason (string)
- metadata (object)
- is_read (boolean, default false)
- is_edited (boolean, default false)
- edited_at (date-time)
- is_deleted (boolean, default false)
```

### 1.5 Notification Rule & Digest Entities

**Entity: NotificationRule**
```
- rule_code (string, unique, e.g. "lead_created_notify_agent")
- rule_name (string)
- description (string)
- trigger_entity (string, the entity to watch, e.g. "Lead", "InspectionRequest")
- trigger_event (enum: created, updated, deleted, status_changed, field_changed, scheduled, reminder)
- trigger_condition (object, MongoDB-style filter — additional conditions for the trigger)
- target_audience (enum: record_owner, assigned_user, role_based, specific_users, entity_related_users)
- target_user_ids (array of strings, if specific_users)
- target_roles (array of strings, if role_based)
- channels (array of strings, which channels to send on)
- template_id (string, reference to NotificationTemplate)
- delay_minutes (number, delay before sending, default 0)
- is_recurring (boolean, default false)
- recurrence_cron (string, cron expression for recurring rules)
- max_sends_per_user (number, cap notifications per user per trigger cycle)
- cooldown_minutes (number, prevent duplicate notifications within this window)
- priority (enum: low, normal, high, urgent, default normal)
- is_active (boolean, default true)
- sort_order (number, default 0)
- created_by_name (string)
```

**Entity: NotificationDigest**
```
- digest_reference (string, unique)
- user_id (string, reference to User)
- digest_type (enum: daily, weekly, realtime_batch)
- period_start (date-time)
- period_end (date-time)
- notification_count (number, total notifications included)
- notification_ids (array of strings, references to NotificationLog)
- summary_text (string, human-readable summary)
- channel (enum: email, in_app, default email)
- status (enum: pending, generated, sent, failed, default pending)
- generated_at (date-time)
- sent_at (date-time)
- metadata (object)
- is_read (boolean, default false)
```

---

## Prompt 2 — Utility Functions (`src/lib/notification-utils.js`)

**Prompt:**
> Create `src/lib/notification-utils.js` containing pure helper functions for the notifications module. This file must not make SDK calls directly — it provides constants, formatters, and render helpers that components import.

**Requirements:**
1. Export `NOTIFICATION_CATEGORIES` array: `[{ key, label, icon, color, description }]` covering transactional, marketing, system, alert, reminder, verification, crm, property, project, payment, account.
2. Export `CHANNEL_TYPES` array: `[{ key, label, icon, color, description }]` covering email, sms, push, in_app, whatsapp, multi_channel.
3. Export `NOTIFICATION_STATUS` map with color classes and labels for: queued, sent, delivered, read, failed, bounced, suppressed, cancelled.
4. Export `CAMPAIGN_STATUS` map with color classes and labels for: draft, scheduled, sending, sent, paused, cancelled, failed.
5. Export `DND_STATUS` map with color classes and labels for: full_dnd, partial_dnd, not_registered, unknown.
6. Export `PRIORITY_LEVELS` array with labels and color classes: low, normal, high, urgent.
7. Export `DIGEST_FREQUENCIES` array: hourly, daily, weekly with labels and descriptions.
8. Export `formatTemplateBody(template, variables)` — replaces `{{variable}}` placeholders in the template body/subject with values from the variables object. Handle missing variables gracefully by leaving the placeholder or substituting an empty string.
9. Export `extractTemplateVariables(template)` — regex-based extraction of all `{{variable}}` placeholders from a template string, returns an array of unique variable names.
10. Export `formatRelativeTime(dateString)` — human-readable relative time (e.g. "2 minutes ago", "3 hours ago", "Yesterday at 14:30") using moment.
11. Export `formatDeliveryRate(sent, delivered)` — returns a percentage string with 1 decimal place.
12. Export `getNotificationIcon(category)` — returns the appropriate lucide icon name string for each notification category (e.g. transactional → "Mail", alert → "AlertTriangle", reminder → "Clock", crm → "Users", property → "Building2", project → "Building", payment → "CreditCard", account → "UserCircle", verification → "ShieldCheck", system → "Settings", marketing → "Megaphone").
13. Export `truncateBody(body, maxLength=120)` — truncates message body with ellipsis.
14. Export `groupNotificationsByDate(notifications)` — groups a list of notification objects by date (Today, Yesterday, This Week, This Month, Earlier) for display.
15. Export `filterNotificationsByCategory(notifications, categories)` — filters notification array by one or more category keys.
16. Export `calculateCampaignMetrics(campaign)` — returns `{ deliveryRate, openRate, bounceRate, optOutRate }` as percentages from a campaign object.
17. Export `getUnreadCount(notifications)` — returns the count of notifications where `is_read` is false.
18. Export `buildAudienceFilter(audienceType, audienceConfig)` — converts an audience type and config object into a MongoDB-style filter for querying recipients.

---

## Prompt 3 — Reusable UI Components

### 3.1 Notification Bell & Center

**Prompt:**
> Create `src/components/notifications/NotificationBell.jsx` — a header icon component showing unread notification count with a badge. Props: `{ unreadCount, onClick }`. Render a bell icon (lucide `Bell`) with a flame-orange count badge when `unreadCount > 0`. Animate the badge with a subtle pulse when count increases. The component should be accessible with an `aria-label`.

**Prompt:**
> Create `src/components/notifications/NotificationCenter.jsx` — a dropdown panel component that shows recent unread notifications. Props: `{ notifications, onMarkRead, onMarkAllRead, onViewAll, onClose }`. Features:
> - Slide-down panel with backdrop blur, max-height 480px, scrollable
> - Header with "Notifications" title, unread count badge, and "Mark all read" button
> - Each notification row: icon (based on category), subject, truncated body, relative time, unread indicator (flame dot)
> - Click a notification: calls `onMarkRead(id)` and navigates to `action_url` if present
> - Empty state: "You're all caught up" with a check icon
> - Footer "View all notifications" link calling `onViewAll`

### 3.2 Notification List & Card

**Prompt:**
> Create `src/components/notifications/NotificationList.jsx` — a full-page list view of all notifications. Props: `{ notifications, loading, onMarkRead, onArchive, onFilter, activeCategory }`. Features:
> - Category filter tabs (All, Transactional, Alerts, Reminders, CRM, Properties, Projects, Payments, System)
> - Grouped by date sections using `groupNotificationsByDate` from notification-utils
> - Each item: category icon, subject, body preview, channel badge, relative time, read/unread state
> - Hover actions: "Mark as read" and "Archive" buttons
> - Loading skeleton state with 6 placeholder rows
> - Empty state with illustration and "No notifications" message

**Prompt:**
> Create `src/components/notifications/NotificationCard.jsx` — a single notification card component. Props: `{ notification, onMarkRead, onArchive }`. Features:
> - Left: circular icon container with category color
> - Center: subject (bold if unread), body preview (2-line truncation), metadata row (channel badge + time)
> - Right: unread dot indicator, action menu (mark read, archive, view detail)
> - If `action_url` exists, entire card is clickable and navigates to it
> - Border-left accent in category color for unread items

### 3.3 Notification Preferences

**Prompt:**
> Create `src/components/notifications/NotificationPreferences.jsx` — a settings panel for user communication preferences. Props: `{ preferences, onChange, onSave, saving }`. Features:
> - Sectioned layout: Channel Settings, Category Preferences, Digest Settings, Quiet Hours
> - Channel Settings: toggle switches for Email, SMS, Push, In-App, WhatsApp
> - Category Preferences: grid of toggle switches for each category × channel combination (e.g. "Marketing Email", "Marketing SMS", "Alert Email", "Alert SMS") — use a matrix grid
> - Transactional categories show a lock icon and tooltip "Required for account security" — cannot be disabled
> - Digest Settings: toggle to enable digest, frequency selector (hourly/daily/weekly), time picker
> - Quiet Hours: toggle, start/end time pickers, channel selector
> - Save button at bottom, shows "Saved" indicator when `saving` completes
> - Language and timezone selectors

### 3.4 Template Editor

**Prompt:**
> Create `src/components/notifications/TemplateEditor.jsx` — a visual editor for notification templates. Props: `{ template, onChange, onSave, onCancel, variables }`. Features:
> - Template metadata fields: name, description, category, channel, priority
> - Subject field (for email channel) with variable chip insertion — clicking a variable from the sidebar inserts `{{variable}}` at cursor position
> - Body editor: for email channel use `react-quill-new` rich text editor; for SMS/WhatsApp use a textarea with character count and SMS segment counter (160 chars per segment)
> - Variables sidebar: lists all available variables from `placeholder_schema` or `variables` prop, click to insert at cursor
> - Live preview panel: renders the template with sample data, showing how the notification will look
> - SMS-specific: character count, segment count, estimated cost (NGN), unicode warning if non-GSM characters detected
> - Validation: checks for unclosed `{{`, missing required variables, subject length (email max 100, SMS max 160)
> - Version history indicator showing current version number

### 3.5 Campaign Builder

**Prompt:**
> Create `src/components/notifications/CampaignBuilder.jsx` — a multi-step wizard for creating communication campaigns. Props: `{ campaign, onSave, onCancel }`. Features:
> - Step 1 — Content: select template, optionally override subject/body, category, priority
> - Step 2 — Audience: audience type selector (All Users, Segment, Filtered, Manual List, Role-based, Entity-based), audience filter builder (for filtered type — render fields based on user attributes: role, state, registration date, last active), live audience count estimate
> - Step 3 — Schedule: send now or schedule for future date/time, recurring toggle with cron pattern selector
> - Step 4 — Channels: multi-select channel checkboxes (email, sms, push, whatsapp), channel-specific options
> - Step 5 — Review: summary of all selections, estimated cost, audience count, compliance check (DND warning for SMS marketing)
> - Progress indicator at top showing current step
> - Navigation: Back/Next buttons, Save as Draft, Send Now / Schedule buttons on final step
> - Compliance warnings: if audience includes SMS marketing to users without opt-in, show NDPR warning banner

### 3.6 Message Thread Components

**Prompt:**
> Create `src/components/notifications/MessageThread.jsx` — a conversation thread view for 2-way messaging. Props: `{ thread, messages, onSend, onReply, loading, currentUser }`. Features:
> - Header: thread subject, participant avatars, status badge, assignee, close/resolve button
> - Message timeline: chat-style layout with inbound (left) and outbound (right) message bubbles
> - Each message: sender avatar/name, body (with formatting), timestamp, delivery status icon, attachments
> - Reply composer at bottom: textarea, attachment button, send button, channel selector if multi-channel
> - Load older messages button at top
> - Typing indicator placeholder (future-ready)
> - Empty thread state

**Prompt:**
> Create `src/components/notifications/ThreadList.jsx` — a sidebar list of conversation threads. Props: `{ threads, activeThreadId, onSelect, onFilter, loading }`. Features:
> - Search/filter bar at top
> - Status filter tabs (All, Active, Awaiting Response, Resolved)
> - Each thread row: participant avatar, subject, last message preview, last message time, unread badge
> - Active thread highlighted with flame left border
> - Pinned threads show pin icon and sort to top
> - Loading skeleton and empty states

### 3.7 Delivery Status & DND Components

**Prompt:**
> Create `src/components/notifications/DeliveryStatusBadge.jsx` — a small badge showing notification delivery status. Props: `{ status, size }`. Use the `NOTIFICATION_STATUS` map from notification-utils for colors and labels. Include appropriate lucide icons (e.g. sent → "Send", delivered → "CheckCheck", read → "CheckCheck" with flame color, failed → "AlertCircle", bounced → "MailX").

**Prompt:**
> Create `src/components/notifications/DNDChecker.jsx` — a component for checking and managing DND (Do Not Disturb) status for phone numbers. Props: `{ phone, onCheckResult, onOverride }`. Features:
> - Input field for phone number with +234 prefix display
> - "Check DND Status" button
> - Status result display: badge showing DND status (full/partial/not registered), categories blocked
> - Override section (admin only): button to override DND for transactional messages, notes field
> - Warning banner if number is on full DND and campaign is marketing type
> - Compliance note: "NDPR requires explicit consent for marketing messages"

---

## Prompt 4 — User-Facing Pages

### 4.1 Notifications Page

**Prompt:**
> Create `src/pages/Notifications.jsx` — the main user-facing notifications page. This page fetches notifications for the current user, displays them in a filterable list, and allows marking as read/archiving. Use the `NotificationList` component and the notification utilities. Features:
> - Page header with "Notifications" title, total count, and "Mark all as read" button
> - Category filter tabs
> - Real-time subscription to new notifications via `base44.entities.NotificationLog.subscribe()` to update the list live
> - Initial load via `base44.entities.NotificationLog.filter({ recipient_user_id: user.id, is_archived: false }, '-created_date', 50)`
> - Mark as read: `base44.entities.NotificationLog.update(id, { is_read: true, read_at: new Date().toISOString() })`
> - Archive: `base44.entities.NotificationLog.update(id, { is_archived: true })`
> - Loading, empty, and error states
> - Responsive: full width on mobile, max-w-4xl centered on desktop

### 4.2 Notification Settings Page

**Prompt:**
> Create `src/pages/NotificationSettings.jsx` — a page where users manage their communication preferences. Use the `NotificationPreferences` component. Features:
> - Load existing preferences via `base44.entities.NotificationPreference.filter({ user_id: user.id })` — if none exist, create a default record
> - Save preferences via `base44.entities.NotificationPreference.update(id, updatedData)`
> - Two-column layout on desktop: left sidebar with section anchors (Channel, Categories, Digest, Quiet Hours), right main content
> - Mobile: single column with accordion sections
> - Save confirmation toast

---

## Prompt 5 — Admin Pages

### 5.1 Admin Notification Center

**Prompt:**
> Create `src/pages/admin/NotificationCenterAdmin.jsx` — an admin command center for system-wide notification management. Tabbed interface with: Overview, Templates, Campaigns, Delivery Log, Threads, Rules, Providers. Features:
> - Overview tab: KPI cards (Total Sent, Delivery Rate, Read Rate, Active Campaigns, Pending Notifications, Failed Today), delivery trend chart (recharts area chart), channel distribution pie chart, recent activity feed
> - Each tab renders its respective component (TemplateManager, CampaignManager, DeliveryLog, ThreadInbox, RuleManager, ProviderManager)
> - Global search bar for notifications
> - Date range filter for analytics

### 5.2 Template Manager

**Prompt:**
> Create `src/components/admin/notifications/TemplateManager.jsx` — admin management for notification templates. Features:
> - Grid/list toggle of templates, filter by category and channel
> - "Create Template" button opening the `TemplateEditor` in a dialog
> - Template cards: name, category badge, channel badge, trigger event, active toggle, version
> - Duplicate, edit, deactivate, delete actions per template
> - Search by template name or code
> - CRUD via `base44.entities.NotificationTemplate`

### 5.3 Campaign Manager

**Prompt:**
> Create `src/components/admin/notifications/CampaignManager.jsx` — admin management for communication campaigns. Features:
> - Campaign table: name, type, status, audience count, sent/delivered/read counts, delivery rate, scheduled time, owner, actions
> - "Create Campaign" button opening `CampaignBuilder`
> - Status filter tabs and search
> - Actions: View, Pause, Resume, Cancel, Duplicate, View Recipients
> - Metrics sparkline per campaign row
> - CRUD via `base44.entities.CommunicationCampaign`

### 5.4 Delivery Log & Analytics

**Prompt:**
> Create `src/components/admin/notifications/DeliveryLog.jsx` — a detailed delivery log table with analytics. Features:
> - Filterable table: date range, channel, status, category, template, recipient
> - Columns: reference, recipient, channel, template, status, sent time, delivered time, read time, actions (view detail, resend)
> - Expandable rows showing full notification body and metadata
> - Bulk actions: bulk resend failed, export CSV
> - Analytics sidebar: delivery rate gauge, channel breakdown, status breakdown, hourly volume chart
> - Pagination and server-side filtering

### 5.5 Thread Inbox

**Prompt:**
> Create `src/components/admin/notifications/ThreadInbox.jsx` — a split-view inbox for managing conversation threads. Left: `ThreadList` component, Right: `MessageThread` component. Features:
> - Assignment: assign thread to staff member
> - Status management: change thread status, add resolution notes
> - Filter threads by type, status, assignee, date
> - Bulk close/resolve threads
> - Real-time subscription to new messages

### 5.6 Rule Manager

**Prompt:**
> Create `src/components/admin/notifications/RuleManager.jsx` — admin management for notification rules. Features:
> - Rule list with trigger entity, trigger event, target audience, channels, active toggle
> - Create/edit rule dialog: select trigger entity, trigger event, build trigger condition filter, select target audience, select channels, choose template, set delay/cooldown
> - Test rule button: simulates the rule against sample data and shows what notifications would be generated
> - Activate/deactivate rules
> - CRUD via `base44.entities.NotificationRule`

### 5.7 Provider Manager

**Prompt:**
> Create `src/components/admin/notifications/ProviderManager.jsx` — admin management for communication providers. Features:
> - Provider cards: name, type, status, health, usage (daily/monthly), cost
> - Provider health monitoring: last health check, health status indicator
> - Usage meters: daily/monthly quota usage bars
> - Edit provider: API endpoint, rate limits, quotas, webhook URL, secret key name
> - Set primary provider per channel type
> - Configure fallback providers
> - CRUD via `base44.entities.CommunicationProvider`

---

## Prompt 6 — Routing & Navigation Integration

**Prompt:**
> Update `src/App.jsx` to add the following routes within the existing `<Layout>` wrapper for public/user-facing pages:
> - `/notifications` → `Notifications` page
> - `/notification-settings` → `NotificationSettings` page
>
> Add the following routes within the existing `ProtectedRoute > DashboardLayout` wrapper for admin pages:
> - `/admin/notifications` → wrapped in `RequirePermission` with `permission="security.view"` → `NotificationCenterAdmin`
>
> Import the new page components at the top of `src/App.jsx` near the existing page imports.
> Add `/notifications` and `/admin/notifications` to the dashboard sidebar navigation in `src/lib/dashboard-nav.js` with appropriate icons (Bell and MessageSquare from lucide-react).

**Prompt:**
> Update the Header component (`src/components/layout/Header.jsx`) to integrate the `NotificationBell` component:
> - Place the bell between the search button and the contact button
> - Fetch unread count on mount via `base44.entities.NotificationLog.filter({ recipient_user_id: user.id, is_read: false })` and subscribe to updates
> - On bell click, render the `NotificationCenter` dropdown
> - On "View all", navigate to `/notifications`

---

## Prompt 7 — Real-Time Notification Delivery

**Prompt:**
> Create a custom hook `src/hooks/useNotifications.js` that encapsulates all notification state management for the current user. The hook should:
> 1. On mount, fetch the current user via `base44.auth.me()`
> 2. Fetch the latest 20 notifications via `base44.entities.NotificationLog.filter({ recipient_user_id: user.id, is_archived: false }, '-created_date', 20)`
> 3. Subscribe to new notifications via `base44.entities.NotificationLog.subscribe((event) => { ... })` — on `create` event, prepend the new notification to state and trigger a browser notification (if permission granted)
> 4. Provide functions: `markAsRead(id)`, `markAllAsRead()`, `archiveNotification(id)`, `getUnreadCount()`
> 5. Return `{ notifications, unreadCount, loading, markAsRead, markAllAsRead, archiveNotification }`
> 6. On unmount, unsubscribe the subscription
> 7. Request browser notification permission on first load if not already granted

---

## Prompt 8 — Backend Functions

### 8.1 Send Notification Function

**Prompt:**
> Create a backend function `base44/functions/sendNotification/entry.ts` that dispatches a notification through the appropriate channel. The function accepts a payload with `template_code`, `recipient` (user_id or email/phone), `variables`, and optional `channel_override`. It should:
> 1. Load the template by `template_code` from `NotificationTemplate` entity
> 2. Load recipient user record if `recipient` is a user_id, extract email/phone
> 3. Render the template body/subject using `formatTemplateBody` logic (replace `{{variable}}` placeholders)
> 4. Check recipient preferences (NotificationPreference) — skip if channel is disabled for the category
> 5. Check DND status for SMS marketing (DNDPreference entity) — skip if blocked
> 6. Create a `NotificationLog` record with status "queued"
> 7. Dispatch via the appropriate provider:
>    - Email: use `base44.integrations.Core.SendEmail` (registered users only)
>    - SMS: call external SMS gateway API (configured via CommunicationProvider secret)
>    - Push: call Firebase Cloud Messaging API
>    - In-app: create the NotificationLog record (already done) — frontend picks up via subscription
>    - WhatsApp: call WhatsApp Business API
> 8. Update the NotificationLog with `sent_at`, `status: "sent"`, and `provider_message_id`
> 9. Return the NotificationLog reference and status

### 8.2 DND Check Function

**Prompt:**
> Create a backend function `base44/functions/checkDNDStatus/entry.ts` that checks the DND (Do Not Disturb) status of a Nigerian phone number via the telecom provider's DND lookup API. Accept `phone_number` in the payload. Return `{ dnd_status, partial_categories, can_receive_marketing, can_receive_transactional }`. Cache the result by creating/updating a `DNDPreference` record.

### 8.3 Campaign Dispatcher Function

**Prompt:**
> Create a backend function `base44/functions/dispatchCampaign/entry.ts` that resolves a campaign's audience, creates CampaignRecipient records, and queues individual notification dispatches. Accept `campaign_id`. Steps:
> 1. Load campaign, resolve audience filter to user list
> 2. For each recipient: check preferences, check DND (for SMS), create CampaignRecipient record and NotificationLog record
> 3. Call `sendNotification` for each (or queue for batch processing)
> 4. Update campaign status to "sending" then "sent" with aggregate counts

---

## Prompt 9 — Workflows

### 9.1 Scheduled Digest Workflow

**Prompt:**
> Create a workflow `base44/workflows/NotificationDigest.jsonc` that runs daily at 08:00 (Africa/Lagos) and generates email digests for users who have `digest_enabled: true`. The workflow should:
> 1. Trigger: `scheduled` with cron `0 8 * * *`
> 2. Call a backend function `base44/functions/generateDigest/entry.ts` that queries users with digest enabled, collects their unread notifications from the past 24 hours, creates `NotificationDigest` records, and calls `sendNotification` with the digest template

### 9.2 Entity-Triggered Notification Workflow

**Prompt:**
> Create a workflow `base44/workflows/LeadNotification.jsonc` that fires when a new Lead is created and sends a notification to the assigned agent. Trigger: `entity` on `Lead` with event `created`. The workflow should call `sendNotification` backend function with template_code `lead_assigned`, recipient as the assigned agent, and variables from the lead record.

### 9.3 Inspection Reminder Workflow

**Prompt:**
> Create a workflow `base44/workflows/InspectionReminder.jsonc` that sends reminder notifications before scheduled inspections. The workflow should:
> 1. Trigger: `scheduled` every hour
> 2. Call a backend function that queries `InspectionRequest` records scheduled within the next 24 hours that haven't had reminders sent
> 3. For each, call `sendNotification` with `inspection_reminder` template 24 hours, 2 hours, and 30 minutes before the scheduled time
> 4. Mark reminders as sent to prevent duplicates

### 9.4 Campaign Scheduler Workflow

**Prompt:**
> Create a workflow `base44/workflows/CampaignScheduler.jsonc` that processes scheduled campaigns. Trigger: `scheduled` every 15 minutes. Call `dispatchCampaign` backend function for any `CommunicationCampaign` records with `status: "scheduled"` and `scheduled_at <= now`.

---

## Prompt 10 — Sample Data Seeding

**Prompt:**
> After all entities are created, seed initial data using `create_entity_records`:
> 1. `NotificationTemplate`: seed 15 templates covering common scenarios (welcome_email, password_reset, lead_assigned, inspection_scheduled, inspection_reminder_24h, inspection_reminder_2h, property_enquiry_received, project_update, payment_confirmation, campaign_newsletter, agent_verification_approved, submission_status_update, support_ticket_created, birthday_message, price_drop_alert)
> 2. `CommunicationProvider`: seed 4 providers (sendemail_builtin, twilio_sms, firebase_push, whatsapp_business)
> 3. `NotificationRule`: seed 8 rules for common automations (lead_created → agent, inspection_scheduled → customer + agent, property_enquiry → property manager, payment_received → customer, new_user → welcome email, password_reset → user, submission_status_changed → owner, birthday → user)
> 4. `DNDPreference`: do not seed — populated dynamically via DND check function

---

## Design System Compliance

All components must adhere to the established design system:
- **Colors:** Brand Navy `#001A3D` (via `bg-brand-*` classes), Flame Orange `#FF7A00` (via `bg-flame-*`), semantic tokens (`success`, `error`, `warning`, `info`)
- **Typography:** Sora for headings (`font-heading`), Inter for body (`font-body`)
- **Components:** Use shadcn/ui from `@/components/ui/*`, lucide-react icons only
- **Styling:** Tailwind CSS literal class strings, glassmorphism (`.glass`), premium shadows (`.shadow-premium`)
- **Responsive:** 12-column grid, mobile-first, 4px base spacing
- **Motion:** Framer Motion for transitions, animate-fade-in, animate-fade-up
- **Imports:** Use `@/` alias for all internal imports
- **Images:** Use `Image` from `@/components/ui/image` for all content images