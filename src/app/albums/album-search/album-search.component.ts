import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { ProgressBarComponent } from '@/shared/ui/progress-bar.component';
import { AlbumFilterComponent } from './album-filter/album-filter.component';
import { AlbumListComponent } from './album-list/album-list.component';
import { albumSearchStore } from '@/shared/state/album-search.store';

@Component({
  selector: 'ngrx-album-search',
  standalone: true,
  imports: [ProgressBarComponent, AlbumFilterComponent, AlbumListComponent],
  providers: [albumSearchStore],
  template: `
    <ngrx-progress-bar [showProgress]="store.showSpinner()" />

    <div class="container">
      <h1>Albums ({{ store.totalAlbums() }})</h1>

      <ngrx-album-filter
        [query]="store..query()"
        [order]="store..order()"
        (queryChange)="store.updateQuery($event)"
        (orderChange)="store.updateOrder($event)"
      />

      <ngrx-album-list
        [albums]="store.filteredAlbums()"
        [showSpinner]="store.showSpinner()"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AlbumSearchComponent {
  private store = inject(albumSearchStore);
}
