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
  slug: string;
  price: number;
  oldPrice?: number;
  category: Category;
  description: string;
  images: ProductImage[];
  material: string;
  color: string;
  size: string;
  stock: number;
  isFeatured: boolean;
  isBestSelling: boolean;
  status: 'active' | 'draft' | 'archived';
  createdAt?: string;
  updatedAt?: string;
};

export type ProductImage = {
  url: string;
  publicId: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type User = {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  status?: 'active' | 'blocked';
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type Order = {
  _id: string;
  userId?: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: 'cash_on_delivery';
  items: Array<{
    productId: string;
    name: string;
    slug: string;
    image?: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProductFilters = {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  availability?: string;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: string;
  bestSelling?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type PaginatedProducts = {
  products: Product[];
  meta: NonNullable<ApiResponse<Product[]>['meta']>;
};
