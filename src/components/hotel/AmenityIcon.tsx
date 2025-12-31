import {
  Wifi,
  Car,
  UtensilsCrossed,
  Wine,
  Sun,
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
  Ship,
  TreePalm
} from 'lucide-react';

interface AmenityIconProps {
  amenity: string;
  className?: string;
}

export function AmenityIcon({ amenity, className = 'h-5 w-5' }: AmenityIconProps) {
  const lowerCaseAmenity = amenity.toLowerCase();

  switch (lowerCaseAmenity) {
    case 'wifi':
      return <Wifi className={className} />;
    case 'parking':
      return <Car className={className} />;
    case 'restaurant':
      return <UtensilsCrossed className={className} />;
    case 'bar':
      return <Wine className={className} />;
    case 'spa':
      return <Sparkles className={className} />;
    case 'pool':
      return <PersonStanding className={className} />;
    case 'gym':
      return <Dumbbell className={className} />;
    case 'mountain-view':
      return <MountainSnow className={className} />;
    case 'garden':
      return <Leaf className={className} />;
    case 'library':
      return <Library className={className} />;
    case 'river-view':
    case 'ghat':
      return <Waves className={className} />;
    case 'adventure':
    case 'trekking':
    case 'skiing':
      return <Bike className={className} />;
    case 'heritage':
      return <Building2 className={className} />;
    case 'safari':
        return <TreePalm className={className}/>;
    default:
      return <BedDouble className={className} />;
  }
}
