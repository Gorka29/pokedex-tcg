import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly FAVORITES_KEY = 'pokemonFavorites';

  constructor() {}

  getFavorites(): string[] {
    const favorites = localStorage.getItem(this.FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  }

  addToFavorites(cardId: string): void {
    const favorites = this.getFavorites();
    if (!favorites.includes(cardId)) {
      favorites.push(cardId);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    }
  }

  removeFromFavorites(cardId: string): void {
    const favorites = this.getFavorites();
    const updatedFavorites = favorites.filter(id => id !== cardId);
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(updatedFavorites));
  }

  isFavorite(cardId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.includes(cardId);
  }
}
