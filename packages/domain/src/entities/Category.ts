export interface Category {
  id: string;
  name: string;
  color: string; // hex, e.g. "#FF5733"
  icon: string; // name from design system
  is_default: boolean;
  created_at: Date;
}
