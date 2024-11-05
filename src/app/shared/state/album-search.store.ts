import { Album, searchAlbums, sortAlbums } from '@/albums/album.model';
import { computed, inject, Injectable } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { SortOrder } from '../models/sort-order.model';
import { exhaustMap, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { AlbumsService } from '@/albums/albums.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface IAlbumSearchStoreState {
  albums: Array<Album>;
  query: string;
  order: SortOrder;
  showProgress: boolean;
}

export const albumSearchStore = signalStore(
  withState<IAlbumSearchStoreState>({
    albums: [],
    query: '',
    order: 'asc',
    showProgress: false,
  }),
  withComputed(({ albums, query, order }) => ({
    filteredAlbums: computed(() => {
      const searchedAlbums = searchAlbums(albums(), query());
      return sortAlbums(searchedAlbums, order());
    }),
  })),
  withComputed(({ filteredAlbums, showProgress }) => ({
    totalAlbums: computed(() => filteredAlbums().length),
    showSpinner: computed(
      () => showProgress() && filteredAlbums().length === 0,
    ),
  })),
  withMethods(
    (
      state,
      albumsService = inject(AlbumsService),
      snackBar = inject(MatSnackBar),
    ) => ({
      updateQuery(query: string): void {
        patchState(state, { query });
      },

      updateOrder(order: SortOrder): void {
        patchState(state, { order });
      },
      loadAllAlbums: rxMethod<void>(
        pipe(
          tap(() => patchState(state, { showProgress: true })),
          exhaustMap(() =>
            albumsService.getAll().pipe(
              tapResponse({
                next: (albums: Album[]) => {
                  patchState(state, { albums, showProgress: false });
                },
                error: () => {
                  patchState(state, { showProgress: false });
                  snackBar.open('Failed to load albums', 'Dismiss');
                },
              }),
            ),
          ),
        ),
      ),
    }),
  ),
  withHooks({
    onInit({ loadAllAlbums }) {
      loadAllAlbums();
    },
  }),
);
