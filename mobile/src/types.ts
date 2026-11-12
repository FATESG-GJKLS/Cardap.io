export type Category = {
  id: number; name: string; slug: string; emoji: string; description: string; sortOrder: number; active: boolean;
};
export type Product = {
  id: number; name: string; description: string; price: number; categoryId: number; categoryName: string;
  imageUrl: string; emoji: string; exotic: boolean; featured: boolean; available: boolean; prepMinutes: number;
};
export type Customer = { id: number; name: string; email: string; role: 'ADMIN' | 'CUSTOMER'; createdAt: string };
export type Auth = { token: string; user: Customer };
export type CartEntry = { product: Product; quantity: number };
export type OrderLine = { productId: number; productName: string; quantity: number; unitPrice: number };
export type Order = { id: number; customerId: number; customerName: string; deliveryAddress: string; paymentMethod: string;
  notes: string; status: string; subtotal: number; deliveryFee: number; total: number; createdAt: string; items: OrderLine[] };
export type AdminSection = 'products' | 'categories' | 'users' | 'orders';
