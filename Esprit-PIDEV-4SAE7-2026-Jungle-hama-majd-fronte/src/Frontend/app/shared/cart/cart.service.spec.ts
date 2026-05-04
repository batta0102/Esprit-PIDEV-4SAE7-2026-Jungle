import { TestBed } from '@angular/core/testing';

import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('should add product to cart', () => {
    service.addToCart({
      idProduct: 1,
      name: 'Book 1',
      category: 'Books',
      description: 'desc',
      stock: 10,
      price: 20,
      imageUrl: '/a.png'
    });

    const cart = service.getCart();
    expect(cart.length).toBe(1);
    expect(cart[0].quantity).toBe(1);
  });

  it('should increase quantity when adding existing product', () => {
    const product = {
      idProduct: 1,
      name: 'Book 1',
      category: 'Books',
      description: 'desc',
      stock: 10,
      price: 20,
      imageUrl: '/a.png'
    };

    service.addToCart(product);
    service.addToCart(product);

    expect(service.getCart()[0].quantity).toBe(2);
  });

  it('should remove product from cart', () => {
    service.addToCart({
      idProduct: 5,
      name: 'Book 5',
      category: 'Books',
      description: 'desc',
      stock: 10,
      price: 15
    });

    service.removeFromCart(5);
    expect(service.getCart().length).toBe(0);
  });

  it('should decrease quantity and remove when quantity reaches zero', () => {
    service.addToCart({
      idProduct: 8,
      name: 'Book 8',
      category: 'Books',
      description: 'desc',
      stock: 10,
      price: 15
    });

    service.decreaseQuantity(8);
    expect(service.getCart().length).toBe(0);
  });

  it('should calculate total', () => {
    service.addToCart({
      idProduct: 2,
      name: 'A',
      category: 'Books',
      description: 'd',
      stock: 1,
      price: 10
    });
    service.addToCart({
      idProduct: 2,
      name: 'A',
      category: 'Books',
      description: 'd',
      stock: 1,
      price: 10
    });

    expect(service.getTotal()).toBe(20);
  });

  it('should clear cart', () => {
    service.addToCart({
      idProduct: 2,
      name: 'A',
      category: 'Books',
      description: 'd',
      stock: 1,
      price: 10
    });

    service.clearCart();

    expect(service.getCart()).toEqual([]);
  });
});
