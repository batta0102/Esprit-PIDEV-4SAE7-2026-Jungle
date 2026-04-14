import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ResourceService } from './resource.service';

describe('ResourceService', () => {
  let service: ResourceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(ResourceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load resources list', () => {
    service.listResources().subscribe((resources) => {
      expect(resources.length).toBe(1);
      expect(resources[0].resourceId).toBe(1);
    });

    const req = httpMock.expectOne('/api/resources/displayResources');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        resourceId: 1,
        title: 'Guide',
        description: 'desc',
        type: 'PDF',
        fileUrl: null,
        uploadDate: null
      }
    ]);
  });

  it('should handle server error when loading resources', () => {
    let status = 0;

    service.listResources().subscribe({
      error: (err) => {
        status = err.status;
      }
    });

    const req = httpMock.expectOne('/api/resources/displayResources');
    req.flush({ message: 'error' }, { status: 500, statusText: 'Server Error' });

    expect(status).toBe(500);
  });
});