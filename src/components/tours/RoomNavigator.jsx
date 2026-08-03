import { Sofa, UtensilsCrossed, BedDouble, Bath, Car, TreePine, Home, Building, Warehouse, Sun, Wrench, DoorOpen } from 'lucide-react';

const ROOM_CONFIG = {
  living_room: { label: 'Living Room', icon: Sofa },
  kitchen: { label: 'Kitchen', icon: UtensilsCrossed },
  dining: { label: 'Dining', icon: UtensilsCrossed },
  bedroom: { label: 'Bedroom', icon: BedDouble },
  bathroom: { label: 'Bathroom', icon: Bath },
  balcony: { label: 'Balcony', icon: Sun },
  garage: { label: 'Garage', icon: Car },
  compound: { label: 'Compound', icon: Home },
  garden: { label: 'Garden', icon: TreePine },
  rooftop: { label: 'Rooftop', icon: Sun },
  utility: { label: 'Utility', icon: Wrench },
  entrance: { label: 'Entrance', icon: DoorOpen },
  hallway: { label: 'Hallway', icon: DoorOpen },
  office: { label: 'Office', icon: Building },
  store: { label: 'Store', icon: Warehouse },
  other: { label: 'Other', icon: Home },
};

export default function RoomNavigator({ scenes = [], activeScene, onSelect }) {
  const rooms = scenes.length > 0 ? scenes : Object.keys(ROOM_CONFIG).slice(0, 6);

  return (
    <div className="rounded-xl border border-brand-100 bg-ice-50 p-4">
      <h4 className="mb-3 font-heading text-sm font-bold text-brand-900">Room Navigation</h4>
      <div className="flex flex-wrap gap-2">
        {rooms.map((scene, i) => {
          const key = typeof scene === 'string' ? scene : scene.room_type || scene.id || `scene-${i}`;
          const label = typeof scene === 'string' ? (ROOM_CONFIG[scene]?.label || scene) : (scene.title || scene.label || ROOM_CONFIG[scene.room_type]?.label || `Scene ${i + 1}`);
          const cfg = ROOM_CONFIG[key] || ROOM_CONFIG.other;
          const Icon = cfg.icon;
          const isActive = activeScene === key || (typeof scene === 'object' && activeScene === scene.id);
          return (
            <button key={i} onClick={() => onSelect?.(typeof scene === 'object' ? scene : key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${isActive ? 'bg-flame-500 text-white' : 'bg-white text-brand-700 border border-brand-100 hover:border-flame-200 hover:bg-flame-50'}`}>
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}