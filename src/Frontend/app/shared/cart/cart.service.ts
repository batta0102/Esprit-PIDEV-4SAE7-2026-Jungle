import { Injectable, signal } from '@angular/core';

import { Product } from '../product/product';
import { CartItem } from './cart-item.model';

const STORAGE_KEY = 'app_cart_items';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly cartSignal = signal<CartItem[]>(this.loadFromStorage());

  getCart(): CartItem[] {
    return this.cartSignal();
  }

  addToCart(product: Product): void {
    const productId = product.idProduct;
    if (!productId) {
      return;
    }

    const current = this.cartSignal();
    const existing = current.find((item) => item.productId === productId);

    if (existing) {
      this.updateItemQuantity(productId, existing.quantity + 1);
      return;
    }

    const item: CartItem = {
      productId,
      productName: product.name,
      price: product.price ?? 0,
      quantity: 1,
      imageUrl: product.imageUrl
    };

    this.setCart([...current, item]);
  }

  removeFromCart(productId: number): void {
    this.setCart(this.cartSignal().filter((item) => item.productId !== productId));
  }

  increaseQuantity(productId: number): void {
    const item = this.cartSignal().find((x) => x.productId === productId);
    if (!item) {
      return;
    }
    this.updateItemQuantity(productId, item.quantity + 1);
  }

  decreaseQuantity(productId: number): void {
    const item = this.cartSignal().find((x) => x.productId === productId);
    if (!item) {
      return;
    }

    if (item.quantity <= 1) {
      this.removeFromCart(productId);
      return;
    }

    this.updateItemQuantity(productId, item.quantity - 1);
  }

  clearCart(): void {
    this.setCart([]);
  }

  getTotal(): number {
    return this.cartSignal().reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  private updateItemQuantity(productId: number, quantity: number): void {
    const updated = this.cartSignal().map((item) =>
      item.productId === productId ? { ...item, quantity } : item
    );
    this.setCart(updated);
  }

  private setCart(items: CartItem[]): void {
    this.cartSignal.set(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  private loadFromStorage(): CartItem[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as CartItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
