export type Role = 'user' | 'admin';

export type Category =
  | 'Earrings'
  | 'Necklaces'
  | 'Rings'
  | 'Bracelets'
  | 'Bangles'
  | 'Anklets'
  | 'Hair Accessories'
  | 'Bridal Jewelry';

export type Product = {
  _id: string;
  name: string;
  slug?: string;
  price: number;
  category: Category;
  description: string;
  images: string[];
  material: string;
  color: string;
  size: string;
  stock: number;
  featured?: boolean;
  bestSelling?: boolean;
  createdAt?: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  role: Role;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type Order = {
  _id: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: 'cash-on-delivery' | 'bkash' | 'nagad' | 'card';
  items: Array<{
    product: Product | string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

export type ProductFilters = {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  availability?: string;
  sort?: string;
};
