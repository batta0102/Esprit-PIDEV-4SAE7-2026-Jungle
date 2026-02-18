import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppBadgeComponent } from '../../components/ui/badge.component';

interface Resource {
  id: number;
  title: string;
  type: 'PDF' | 'Video' | 'Audio';
  size: string;
  level: string;
  downloads: number;
  theme: string;
}

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, FormsModule, AppBadgeComponent],
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss']
})
export class ResourcesComponent {
  searchQuery = '';
  selectedTypes: ('PDF' | 'Video' | 'Audio')[] = [];
  selectedLevels: string[] = [];

  resources: Resource[] = [
    {
      id: 1,
      title: 'Advanced Grammar Guide',
      type: 'PDF',
      size: '2.4 MB',
      level: 'C1',
      theme: 'Grammar',
      downloads: 124
    },
    {
      id: 2,
      title: 'Vowel Pronunciation',
      type: 'Video',
      size: '15 min',
      level: 'A1',
      theme: 'Phonetics',
      downloads: 85
    },
    {
      id: 3,
      title: 'Podcast: History of English',
      type: 'Audio',
      size: '45 min',
      level: 'B2',
      theme: 'Culture',
      downloads: 210
    },
    {
      id: 4,
      title: 'Conjugation Exercises',
      type: 'PDF',
      size: '1.1 MB',
      level: 'A2',
      theme: 'Conjugation',
      downloads: 340
    }
  ];

  toggleTypeFilter(type: 'PDF' | 'Video' | 'Audio'): void {
    const index = this.selectedTypes.indexOf(type);
    if (index > -1) {
      this.selectedTypes.splice(index, 1);
    } else {
      this.selectedTypes.push(type);
    }
  }

  toggleLevelFilter(level: string): void {
    const index = this.selectedLevels.indexOf(level);
    if (index > -1) {
      this.selectedLevels.splice(index, 1);
    } else {
      this.selectedLevels.push(level);
    }
  }

  filteredResources(): Resource[] {
    return this.resources.filter((r) => {
      const matchesSearch = r.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesType = this.selectedTypes.length === 0 || this.selectedTypes.includes(r.type);
      const matchesLevel = this.selectedLevels.length === 0 || 
        this.selectedLevels.some((l) => r.level.startsWith(l.substring(0, 2)));
      return matchesSearch && matchesType && matchesLevel;
    });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'PDF':
        return '📄';
      case 'Video':
        return '🎥';
      case 'Audio':
        return '🎙';
      default:
        return '📄';
    }
  }

  getLevelVariant(level: string): 'primary' | 'secondary' | 'accent' | 'success' | 'warning' {
    if (level.startsWith('C')) return 'accent';
    if (level.startsWith('B')) return 'warning';
    return 'secondary';
  }
}

