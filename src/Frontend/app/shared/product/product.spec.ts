import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ProductService } from './product';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load all products and normalize image/id fields', () => {
    service.getAllProducts().subscribe((products) => {
      expect(products.length).toBe(1);
      expect(products[0].idProduct).toBe(10);
      expect(products[0].imageUrl).toBe('/uploads/products/a.png');
    });

    const req = httpMock.expectOne('/api/products/allProducts');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: 10,
        name: 'Book',
        category: 'Books',
        description: 'Desc',
        imageUrl: 'a.png',
        stock: 6
      }
    ]);
  });

  it('should load product by id', () => {
    service.getProductById(7).subscribe((product) => {
      expect(product.idProduct).toBe(7);
      expect(product.name).toBe('P7');
    });

    const req = httpMock.expectOne('/api/products/getProduct/7');
    expect(req.request.method).toBe('GET');
    req.flush({
      idProduct: 7,
      name: 'P7',
      category: 'Books',
      description: 'Desc',
      stock: 3
    });
  });

  it('should call add product without idProduct field in body', () => {
    service
      .addProduct({
        idProduct: 100,
        name: 'New',
        category: 'Books',
        description: 'D',
        stock: 10
      })
      .subscribe();

    const req = httpMock.expectOne('/api/products/addProduct');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.idProduct).toBeUndefined();
    expect(req.request.body.name).toBe('New');
    req.flush({ idProduct: 100 });
  });

  it('should call update product', () => {
    const body = {
      idProduct: 5,
      name: 'Updated',
      category: 'EBook',
      description: 'Updated desc',
      stock: 2
    };

    service.updateProduct(5, body).subscribe();

    const req = httpMock.expectOne('/api/products/updateProduct/5');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush(body);
  });

  it('should call delete product', () => {
    service.deleteProduct(12).subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('/api/products/deleteProduct/12');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should handle error when getAllProducts fails', () => {
    let status = 0;

    service.getAllProducts().subscribe({
      error: (err) => {
        status = err.status;
      }
    });

    const req = httpMock.expectOne('/api/products/allProducts');
    req.flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(status).toBe(500);
  });

  it('should resolveImageUrl based on path type', () => {
    expect(service.resolveImageUrl(null)).toBe('/englishimg2.png');
    expect(service.resolveImageUrl('https://cdn.com/a.png')).toBe('https://cdn.com/a.png');
    expect(service.resolveImageUrl('/uploads/products/a.png')).toBe('http://localhost:8089/uploads/products/a.png');
    expect(service.resolveImageUrl('/assets/a.png')).toBe('/assets/a.png');
    expect(service.resolveImageUrl('raw.png')).toBe('http://localhost:8089/uploads/products/raw.png');
  });
});
