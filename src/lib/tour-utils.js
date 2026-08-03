/**
 * Shared utilities for the Property Tour & Virtual Experience Module.
 */
import { formatPrice, formatNumber, buildShortLocation } from '@/lib/property-utils';

export { formatPrice, formatNumber, buildShortLocation };

export const TOUR_TYPE_CONFIG = {
  '360_tour': { label: '360° Tour', icon: 'View', badge: 'bg-info text-white' },
  vr_tour: { label: 'VR Tour', icon: 'Box', badge: 'bg-brand-700 text-white' },
  panorama: { label: 'Panorama', icon: 'Scan', badge: 'bg-flame-500 text-white' },
  guided_tour: { label: 'Guided Tour', icon: 'Navigation', badge: 'bg-success text-white' },
  interactive: { label: 'Interactive', icon: 'MousePointer', badge: 'bg-purple-600 text-white' },
};

export const TOUR_PROVIDER_CONFIG = {
  matterport: { label: 'Matterport', color: '#001A3D' },
  kuula: { label: 'Kuula', color: '#FF7A00' },
  roundme: { label: 'RoundMe', color: '#3b82f6' },
  'custom_360': { label: 'Custom 360°', color: '#22c55e' },
  panorama: { label: 'Panorama', color: '#8b5cf6' },
  guided_tour: { label: 'Guided', color: '#f59e0b' },
  other: { label: 'Other', color: '#64748b' },
};

export const MEDIA360_TYPE_CONFIG = {
  '360_image': { label: '360° Image', icon: 'View' },
  '360_video': { label: '360° Video', icon: 'Video' },
  virtual_tour: { label: 'Virtual Tour', icon: 'Box' },
  matterport: { label: 'Matterport', icon: 'Scan' },
  street_view: { label: 'Street View', icon: 'Map' },
};

export const DRONE_MEDIA_TYPE_CONFIG = {
  drone_image: { label: 'Drone Image', icon: 'Camera' },
  drone_video: { label: 'Drone Video', icon: 'Video' },
  aerial_survey: { label: 'Aerial Survey', icon: 'Map' },
  topographic: { label: 'Topographic', icon: 'Mountain' },
  orthophoto: { label: 'Orthophoto', icon: 'Map' },
  progress_photo: { label: 'Progress Photo', icon: 'Camera' },
  site_overview: { label: 'Site Overview', icon: 'Building2' },
};

export const VIDEO_TYPE_CONFIG = {
  promotional: { label: 'Promotional', icon: 'PlayCircle' },
  drone: { label: 'Drone Footage', icon: 'Video' },
  walkthrough: { label: 'Walkthrough', icon: 'Navigation' },
  construction_progress: { label: 'Construction Progress', icon: 'HardHat' },
  interview: { label: 'Interview', icon: 'Headphones' },
  other: { label: 'Other', icon: 'Play' },
};

export const FLOOR_PLAN_TYPE_CONFIG = {
  floor_plan: { label: 'Floor Plan', icon: 'Grid3x3' },
  site_plan: { label: 'Site Plan', icon: 'Map' },
  estate_layout: { label: 'Estate Layout', icon: 'Grid3x3' },
  building_plan: { label: 'Building Plan', icon: 'Building2' },
  survey_plan: { label: 'Survey Plan', icon: 'Map' },
  sectional: { label: 'Sectional', icon: 'Layers' },
};

export const ROOM_LABELS = {
  living_room: 'Living Room',
  kitchen: 'Kitchen',
  dining: 'Dining',
  bedroom: 'Bedroom',
  bathroom: 'Bathroom',
  balcony: 'Balcony',
  garage: 'Garage',
  compound: 'Compound',
  garden: 'Garden',
  rooftop: 'Rooftop',
  utility: 'Utility Space',
  entrance: 'Entrance',
  hallway: 'Hallway',
  staircase: 'Staircase',
  terrace: 'Terrace',
  pool: 'Pool Area',
  gym: 'Gym',
  office: 'Office',
  store: 'Store',
  other: 'Other',
};

export const TOUR_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Tours' },
  { value: 'oldest', label: 'Oldest Tours' },
  { value: 'featured', label: 'Featured First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
];

export const TOUR_BENEFITS = [
  { icon: 'Clock', title: 'Explore Anytime', description: 'Visit properties 24/7 from the comfort of your home or office — no appointment needed.' },
  { icon: 'Eye', title: 'Full Immersion', description: '360° views, drone footage, and interactive floor plans give you the full picture.' },
  { icon: 'Navigation', title: 'Room-by-Room', description: 'Navigate naturally between spaces with hotspot-guided tours and scene switching.' },
  { icon: 'CheckCircle2', title: 'Informed Decisions', description: 'Experience properties in detail before booking a physical inspection or making an offer.' },
];