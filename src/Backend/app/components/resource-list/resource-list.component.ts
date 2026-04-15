  import { Component, OnInit, ChangeDetectionStrategy, computed, signal, inject } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { RouterModule } from '@angular/router';
  import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
  import { ResourceService } from '../../services/resource.service';
  import { Resource, ResourceResponse } from '../../models/resource.model';
  import { AdminPageShellComponent, AdminStat } from '../../shared/admin-page-shell/admin-page-shell.component';

  @Component({
    selector: 'app-resource-list',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, AdminPageShellComponent],
    templateUrl: './resource-list.component.html',
    styleUrls: ['./resource-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class ResourceListComponent implements OnInit {
    private resourceService = inject(ResourceService);
    private fb = inject(FormBuilder);

    resources = signal<ResourceResponse[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);
    showCreateModal = signal(false);
    selectedTab = signal('all');
    searchTerm = signal('');
    sortFilter = signal('Sort: Newest');

    readonly resourceTypes = ['PDF', 'VIDEO', 'AUDIO', 'DOCUMENT'];
    readonly createForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      fileUrl: ['']
    });

    readonly tabs = [
      { label: 'All', value: 'all' },
      { label: 'PDF', value: 'pdf' },
      { label: 'Video', value: 'video' },
      { label: 'Audio', value: 'audio' },
      { label: 'Document', value: 'document' }
    ];

    readonly filters = computed(() => [
      {
        label: 'Sort',
        options: ['Sort: Newest', 'Sort: Oldest', 'Sort: Title A → Z'],
        value: this.sortFilter()
      }
    ]);

    readonly displayedResources = computed(() => {
      let items = [...this.resources()];
      const tab = this.selectedTab();
      const search = this.searchTerm().trim().toLowerCase();
      const sort = this.sortFilter();

      if (tab !== 'all') {
        items = items.filter((resource) => (resource.type || '').toLowerCase() === tab);
      }

      if (search) {
        items = items.filter((resource) =>
          `${resource.title} ${resource.type} ${resource.description}`.toLowerCase().includes(search)
        );
      }

      if (sort === 'Sort: Newest') {
        items.sort((a, b) => new Date(b.uploadDate || 0).getTime() - new Date(a.uploadDate || 0).getTime());
      } else if (sort === 'Sort: Oldest') {
        items.sort((a, b) => new Date(a.uploadDate || 0).getTime() - new Date(b.uploadDate || 0).getTime());
      } else {
        items.sort((a, b) => a.title.localeCompare(b.title));
      }

      return items;
    });

    readonly stats = computed<AdminStat[]>(() => {
      const items = this.resources();
      const total = items.length;
      const pdf = items.filter((resource) => resource.type === 'PDF').length;
      const video = items.filter((resource) => resource.type === 'VIDEO' || resource.type === 'Video').length;
      const audio = items.filter((resource) => resource.type === 'AUDIO' || resource.type === 'Audio').length;
      const document = items.filter((resource) => resource.type === 'DOCUMENT' || resource.type === 'Document').length;

      return [
        { label: 'Total Resources', value: total },
        { label: 'PDF', value: pdf, accent: 'blue' },
        { label: 'Video', value: video, accent: 'green' },
        { label: 'Audio', value: audio, accent: 'orange' },
        { label: 'Document', value: document }
      ];
    });

    ngOnInit(): void {
      this.loadResources();
    }

    loadResources(): void {
      this.loading.set(true);
      this.error.set(null);

      this.resourceService.getAll().subscribe({
        next: (data) => {
          console.log('%c=== BACKEND RESPONSE DEBUG ===', 'color: blue; font-weight: bold;');
          console.log('Total resources:', data.length);
          console.log('Raw data:', JSON.stringify(data, null, 2));
          
          if (data && Array.isArray(data) && data.length > 0) {
            console.log('%c=== FIRST RESOURCE ANALYSIS ===', 'color: green; font-weight: bold;');
            const first = data[0];
            console.log('First resource:', first);
            console.table(first);
            
            const keys = Object.keys(first);
            console.log(`All field names: ${keys.join(', ')}`);
            
            console.log('%c=== FIELD VALUES ===', 'color: orange; font-weight: bold;');
            keys.forEach(key => {
              const value = (first as any)[key];
              console.log(`${key}: "${value}" (type: ${typeof value})`);
            });
            
            // Look for any field that might be an ID
            const possibleIdFields = keys.filter(k => 
              k.toLowerCase().includes('id') || 
              k.toLowerCase().includes('pk') || 
              k === 'id' ||
              k === 'ID' ||
              k === 'Id'
            );
            console.log('%c=== POSSIBLE ID FIELDS ===', 'color: red; font-weight: bold;');
            console.log('Fields containing "id" or "pk":', possibleIdFields);
            console.log('Please use one of these field names!');
          }
          
          this.resources.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading resources:', err);
          this.error.set(err.message || 'Failed to load resources');
          this.loading.set(false);
        }
      });
    }

    deleteResource(id: number | string | undefined): void {
      console.log('Delete called with ID:', id, 'Type:', typeof id);
      
      if (!id) {
        this.error.set('Cannot delete: Resource ID is missing or invalid');
        return;
      }
      
      if (confirm('Are you sure you want to delete this resource?')) {
        this.resourceService.delete(id as number).subscribe({
          next: () => {
            this.resources.update(resources =>
              resources.filter(r => r.resourceId !== id)
            );
          },
          error: (err) => {
            this.error.set(err.message || 'Failed to delete resource');
          }
        });
      }
    }

    getTypeIcon(type: string): string {
      const typeMap: Record<string, string> = {
        'PDF': '📄',
        'Video': '🎥',
        'Audio': '🎧',
        'Document': '📋'
      };
      return typeMap[type] || '📎';
    }

    // Helper to get resource ID
    getResourceId(resource: any): number | string | undefined {
      const idValue = resource?.resourceId;
      console.log(`✓ Found ressource ID: ${idValue}`);
      return idValue;
    }

    // Debug method - call this in browser console to inspect structure
    inspectFirstResource(): void {
      if (this.resources().length > 0) {
        const first = this.resources()[0];
        console.log('%c=== RESOURCE STRUCTURE ===', 'color: purple; font-size: 14px; font-weight: bold;');
        console.log('JSON:', JSON.stringify(first, null, 2));
        console.log('Keys:', Object.keys(first).join(', '));
        return first as any;
      }
    }

    onTabChange(tab: string): void {
      this.selectedTab.set(tab);
    }

    onSearchChange(search: string): void {
      this.searchTerm.set(search);
    }

    onFilterChange(change: { label: string; value: string }): void {
      if (change.label === 'Sort') {
        this.sortFilter.set(change.value);
      }
    }

    openCreateForm(): void {
      this.createForm.reset({
        title: '',
        type: 'PDF',
        description: '',
        fileUrl: ''
      });
      this.showCreateModal.set(true);
    }

    closeCreateForm(): void {
      this.showCreateModal.set(false);
    }

    submitCreateForm(): void {
      if (this.createForm.invalid) {
        this.createForm.markAllAsTouched();
        return;
      }

      const formValue = this.createForm.getRawValue();
      const payload: Resource = {
        title: formValue.title ?? '',
        type: formValue.type ?? 'PDF',
        description: formValue.description ?? '',
        fileUrl: formValue.fileUrl ?? ''
      };

      this.loading.set(true);
      this.error.set(null);

      this.resourceService.create(payload).subscribe({
        next: (createdResource) => {
          this.resources.update((items) => [createdResource, ...items]);
          this.loading.set(false);
          this.showCreateModal.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Failed to create resource');
          this.loading.set(false);
        }
      });
    }

    fieldError(fieldName: 'title' | 'type' | 'description'): string | null {
      const field = this.createForm.get(fieldName);
      if (!field || !(field.invalid && (field.touched || field.dirty))) return null;
      if (field.errors?.['required']) return `${fieldName} is required`;
      if (field.errors?.['minlength']) return `${fieldName} is too short`;
      return null;
    }
  }