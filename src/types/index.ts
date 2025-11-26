export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  notes: string[];
  image: string;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}