
import {
  Wifi,
  Car,
  UtensilsCrossed,
  Wine,
  PersonStanding,
  Dumbbell,
  BedDouble,
  MountainSnow,
  Sparkles,
  Leaf,
  Library,
  Waves,
  Bike,
  Building2,
  TreePalm,
  Handshake,
  Recycle,
  Droplets,
  Sprout,
  Hospital,
  Shield,
  Signal,
  Sunrise,
  Wind,
  Church,
  Yoga
} from 'lucide-react';

interface AmenityIconProps {
  amenity: string;
  className?: string;
}

export function AmenityIcon({ amenity, className = 'h-5 w-5' }: AmenityIconProps) {
  const lowerCaseAmenity = amenity.toLowerCase();

  switch (lowerCaseAmenity) {
    // Standard Amenities
    case 'wifi': return <Wifi className={className} />;
    case 'parking': return <Car className={className} />;
    case 'restaurant': return <UtensilsCrossed className={className} />;
    case 'bar': return <Wine className={className} />;
    case 'spa': return <Sparkles className={className} />;
    case 'pool': return <Waves className={className} />;
    case 'gym': return <Dumbbell className={className} />;
    case 'mountain-view': return <MountainSnow className={className} />;
    case 'garden': return <Leaf className={className} />;
    case 'library': return <Library className={className} />;
    case 'river-view': return <Waves className={className} />;
    case 'ghat': return <Waves className={className} />;
    case 'adventure': return <Bike className={className} />;
    case 'trekking': return <Bike className={className} />;
    case 'skiing': return <MountainSnow className={className} />;
    case 'heritage': return <Building2 className={className} />;
    case 'safari': return <TreePalm className={className}/>;
    
    // Eco Practices
    case 'watersaving':
    case 'water-saving': return <Droplets className={className} />;
    case 'plasticfree':
    case 'plastic-free': return <Recycle className={className} />;
    case 'localsourcing':
    case 'local-sourcing': return <Sprout className={className} />;
    
    // Safety Info
    case 'hospital': return <Hospital className={className} />;
    case 'police': return <Shield className={className} />;
    case 'network': return <Signal className={className} />;
    
    // Spiritual Amenities
    case 'meditation-friendly': return <Yoga className={className} />;
    case 'silent-zone': return <Wind className={className} />;
    case 'sunrise-view': return <Sunrise className={className} />;
    case 'temple-nearby': return <Church className={className} />;
    case 'yoga-sessions': return <PersonStanding className={className} />;

    // Trust
    case 'verified-host': return <Handshake className={className} />;

    default:
      return <BedDouble className={className} />;
  }
}
