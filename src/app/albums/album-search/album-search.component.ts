import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { ProgressBarComponent } from '@/shared/ui/progress-bar.component';
import { SortOrder } from '@/shared/models/sort-order.model';
import { Album, searchAlbums, sortAlbums } from '@/albums/album.model';
import { AlbumFilterComponent } from './album-filter/album-filter.component';
import { AlbumListComponent } from './album-list/album-list.component';
import { patchState, signalState } from '@ngrx/signals';
import { AlbumsService } from '../albums.service';
import { MatSnackBarRef, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'ngrx-album-search',
  standalone: true,
  imports: [ProgressBarComponent, AlbumFilterComponent, AlbumListComponent],
  template: `
    <ngrx-progress-bar [showProgress]="showSpinner()" />

    <div class="container">
      <h1>Albums ({{ totalAlbums() }})</h1>

      <ngrx-album-filter
        [query]="searchState.query()"
        [order]="searchState.order()"
        (queryChange)="updateQuery($event)"
        (orderChange)="updateOrder($event)"
      />

      <ngrx-album-list [albums]="filteredAlbums()" [showSpinner]="showSpinner()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AlbumSearchComponent implements OnInit {

  private albumsService = inject(AlbumsService);
  private matSnackBar = inject(MatSnackBar);


  searchState = signalState<{albums: Array<Album>, query: string, order: SortOrder, showProgress: boolean}>({
    albums: [],
    query: '',
    order: 'asc',
    showProgress: false,
  });

  filteredAlbums = computed(() => {
    const albums = searchAlbums(this.searchState.albums(), this.searchState.query() );
    return sortAlbums(albums, this.searchState.order());
  });

  totalAlbums = computed(() => this.filteredAlbums().length);
  showSpinner = computed(() => this.searchState.showProgress() && this.filteredAlbums().length === 0);

  ngOnInit(): void {
    patchState(this.searchState, { showProgress: true });
      this.albumsService.getAll().subscribe({
        next: (albums: Album[]) => {
          patchState(this.searchState, { albums, showProgress: false });
        },
        error: () => {
          patchState(this.searchState, { showProgress: false });
          this.matSnackBar.open('Failed to load albums', 'Dismiss');

        }
      });
  }

  updateQuery(query: string): void {
    patchState(this.searchState, { query });
  }

  updateOrder(order: SortOrder): void {
    patchState(this.searchState, { order });
  }
}
