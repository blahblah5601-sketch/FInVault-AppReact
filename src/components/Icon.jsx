// src/components/Icon.jsx
import { 
  UtensilsCrossed, 
  ShoppingCart, 
  Receipt, 
  PackagePlus, 
  PiggyBank, 
  Shield,
  CreditCard // Add any other icon you use from your data
} from 'lucide-react';

// This object maps the string name from your database to the actual icon component
const iconMap = {
  'utensils-crossed': UtensilsCrossed,
  'shopping-cart': ShoppingCart,
  'receipt': Receipt,
  'package-plus': PackagePlus,
  'piggy-bank': PiggyBank,
  'shield': Shield,
  'credit-card': CreditCard,
};

// This component looks up the icon in the map and renders it
function Icon({ name, className }) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    // Return a default icon or null if the name is not found
    return <CreditCard className={className} />; 
  }

  return <IconComponent className={className} />;
}

export default Icon;