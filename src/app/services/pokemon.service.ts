import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface SearchState {
  query: string;
  page: number;
  scrollPosition: number;
}

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private apiUrl = 'https://api.pokemontcg.io/v2'; // Base URL de la API
  private apiKey = '0315c841-fde4-47f9-beac-80067a4c1951'; // Reemplaza con tu clave de API

  // Añadir estas propiedades para mantener el estado
  private readonly SEARCH_STATE_KEY = 'pokemonSearchState';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Método para guardar el estado
  saveSearchState(query: string, page: number, scrollPosition: number) {
    if (isPlatformBrowser(this.platformId)) {
      console.log('Guardando estado:', { query, page, scrollPosition });
      const state: SearchState = {
        query,
        page,
        scrollPosition
      };
      localStorage.setItem(this.SEARCH_STATE_KEY, JSON.stringify(state));
    }
  }

  // Método para recuperar el estado
  getSearchState(): SearchState {
    if (isPlatformBrowser(this.platformId)) {
      const state = localStorage.getItem(this.SEARCH_STATE_KEY);
      const parsedState = state ? JSON.parse(state) : {
        query: '',
        page: 1,
        scrollPosition: 0
      };
      console.log('Recuperando estado:', parsedState);
      return parsedState;
    }
    return { query: '', page: 1, scrollPosition: 0 };
  }

  getCards(page: number = 1, pageSize: number = 16, query: string = ''): Observable<any> {
    const headers = { 'X-Api-Key': this.apiKey };
    const searchQuery = query ? `&q=name:*${query}*` : '';
    return this.http.get(`${this.apiUrl}/cards?page=${page}&pageSize=${pageSize}${searchQuery}`, { headers });
  }

  getCardById(id: string): Observable<any> {
    const headers = { 'X-Api-Key': this.apiKey };
    return this.http.get(`${this.apiUrl}/cards/${id}`, { headers });
  }

  clearSearchState() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.SEARCH_STATE_KEY);
    }
  }
}
