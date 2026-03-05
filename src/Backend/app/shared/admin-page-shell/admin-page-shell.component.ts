import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AdminStat {
  label: string;
  value: number;
  accent?: 'green' | 'orange' | 'blue';
}

export interface AdminTab {
  label: string;
  value: string;
}

export interface AdminFilter {
  label: string;
  options: string[];
  value: string;
}

@Component({
  selector: 'app-admin-page-shell',
  imports: [CommonModule],
  templateUrl: './admin-page-shell.component.html',
  styleUrl: './admin-page-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPageShellComponent {
  readonly title = input.required<string>();
  readonly addLabel = input<string>('+ Add');
  readonly stats = input<AdminStat[]>([]);
  readonly tabs = input<AdminTab[]>([]);
  readonly selectedTab = input<string>('all');
  readonly showSearch = input<boolean>(true);
  readonly searchPlaceholder = input<string>('Search...');
  readonly filters = input<AdminFilter[]>([]);

  readonly add = output<void>();
  readonly tabChange = output<string>();
  readonly searchChange = output<string>();
  readonly filterChange = output<{ label: string; value: string }>();

  onSearch(value: string): void {
    this.searchChange.emit(value);
  }

  onFilter(label: string, value: string): void {
    this.filterChange.emit({ label, value });
  }
}
