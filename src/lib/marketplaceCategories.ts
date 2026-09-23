/**
 * Data-driven marketplace categories.
 * Add entries here — UI reads from this list (no hard-coded category grids).
 */

export interface MarketplaceCategory {
  id: string;
  label: string;
  labelSo?: string;
  icon: string;
  subcategories?: { id: string; label: string }[];
}

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  {
    id: "cars-vehicles",
    label: "Cars & Vehicles",
    icon: "car",
    subcategories: [
      { id: "cars", label: "Cars" },
      { id: "motorbikes", label: "Motorbikes" },
      { id: "parts", label: "Parts & Accessories" },
    ],
  },
  {
    id: "property",
    label: "Property",
    icon: "home",
    subcategories: [
      { id: "rent", label: "For Rent" },
      { id: "sale", label: "For Sale" },
      { id: "land", label: "Land" },
    ],
  },
  {
    id: "phones",
    label: "Phones",
    icon: "phone",
    subcategories: [
      { id: "smartphones", label: "Smartphones" },
      { id: "feature", label: "Feature Phones" },
      { id: "accessories", label: "Accessories" },
    ],
  },
  {
    id: "electronics",
    label: "Electronics",
    icon: "zap",
    subcategories: [
      { id: "tv", label: "TVs" },
      { id: "audio", label: "Audio" },
      { id: "cameras", label: "Cameras" },
    ],
  },
  { id: "fashion", label: "Fashion", icon: "shirt" },
  { id: "beauty", label: "Beauty", icon: "sparkles" },
  { id: "home-furniture", label: "Home & Furniture", icon: "sofa" },
  { id: "appliances", label: "Appliances", icon: "plug" },
  { id: "livestock", label: "Livestock", icon: "paw" },
  { id: "agriculture", label: "Agriculture", icon: "leaf" },
  { id: "food-groceries", label: "Food & Groceries", icon: "basket" },
  { id: "businesses", label: "Businesses for Sale", icon: "briefcase" },
  { id: "jobs-services", label: "Jobs & Services", icon: "wrench" },
  {
    id: "computers",
    label: "Computers",
    icon: "laptop",
    subcategories: [
      { id: "laptops", label: "Laptops" },
      { id: "desktops", label: "Desktops" },
      { id: "parts", label: "Parts" },
    ],
  },
  { id: "accessories", label: "Accessories", icon: "watch" },
  { id: "jewelry", label: "Jewelry", icon: "gem" },
  { id: "kids-baby", label: "Kids & Baby", icon: "baby" },
  { id: "sports", label: "Sports", icon: "sport" },
  { id: "books", label: "Books", icon: "book" },
  { id: "other", label: "Other", icon: "box" },
];

export function getCategoryById(id: string): MarketplaceCategory | undefined {
  return MARKETPLACE_CATEGORIES.find((c) => c.id === id);
}

export function getCategoryLabel(id: string): string {
  return getCategoryById(id)?.label || id;
}

export const CATEGORY_ATTRIBUTES: Record<
  string,
  { key: string; label: string; type?: "text" | "number" }[]
> = {
  "cars-vehicles": [
    { key: "make", label: "Make" },
    { key: "model", label: "Model" },
    { key: "year", label: "Year", type: "number" },
    { key: "mileage", label: "Mileage (km)", type: "number" },
    { key: "transmission", label: "Transmission" },
    { key: "fuelType", label: "Fuel type" },
  ],
  property: [
    { key: "propertyType", label: "Property type" },
    { key: "bedrooms", label: "Bedrooms", type: "number" },
    { key: "bathrooms", label: "Bathrooms", type: "number" },
    { key: "landSize", label: "Land size" },
  ],
  phones: [
    { key: "brand", label: "Brand" },
    { key: "model", label: "Model" },
    { key: "storage", label: "Storage" },
    { key: "warranty", label: "Warranty" },
  ],
  computers: [
    { key: "brand", label: "Brand" },
    { key: "model", label: "Model" },
    { key: "ram", label: "RAM" },
    { key: "storage", label: "Storage" },
  ],
};

export const CONDITIONS = [
  { id: "new", label: "New" },
  { id: "like-new", label: "Like new" },
  { id: "good", label: "Good" },
  { id: "fair", label: "Fair" },
  { id: "for-parts", label: "For parts" },
] as const;

export const DELIVERY_OPTIONS = [
  { id: "pickup", label: "Pickup" },
  { id: "seller-delivery", label: "Seller delivery" },
  { id: "buyer-arranged", label: "Buyer-arranged delivery" },
  { id: "courier", label: "Courier" },
  { id: "negotiable", label: "Negotiable" },
] as const;

export type ListingCondition = (typeof CONDITIONS)[number]["id"];
export type DeliveryOptionId = (typeof DELIVERY_OPTIONS)[number]["id"];
