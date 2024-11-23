import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface SearchState {
  query: string;
  page: number;
  selectedSet: string;
  selectedType: string;
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
  saveSearchState(query: string, page: number, selectedSet: string = '', selectedType: string = '') {
    if (isPlatformBrowser(this.platformId)) {
      const state: SearchState = {
        query,
        page,
        selectedSet,
        selectedType
      };
      localStorage.setItem(this.SEARCH_STATE_KEY, JSON.stringify(state));
    }
  }

  // Método para recuperar el estado
  getSearchState(): SearchState {
    if (isPlatformBrowser(this.platformId)) {
      const state = localStorage.getItem(this.SEARCH_STATE_KEY);
      return state ? JSON.parse(state) : {
        query: '',
        page: 1,
        selectedSet: '',
        selectedType: ''
      };
    }
    return { query: '', page: 1, selectedSet: '', selectedType: '' };
  }

  getCards(page: number = 1, pageSize: number = 16, query: string = '', set: string = '', type: string = ''): Observable<any> {
    const headers = { 'X-Api-Key': this.apiKey };
    let searchQuery = '';
    if (query) {
      const cleanQuery = query.replace(/"/g, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      searchQuery = `name:"${cleanQuery}"`;
    }
    if (set) {
      searchQuery += searchQuery ? ` set.id:${set}` : `set.id:${set}`;
    }
    if (type) {
      searchQuery += searchQuery ? ` types:${type}` : `types:${type}`;
    }
    const queryParam = searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : '';
    return this.http.get(`${this.apiUrl}/cards?page=${page}&pageSize=${pageSize}${queryParam}`, { headers });
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

  getSets(): Observable<any> {
    const headers = { 'X-Api-Key': this.apiKey };
    return this.http.get(`${this.apiUrl}/sets`, { headers });
  }

  getTypes(): Observable<string[]> {
    return this.http.get<any>(`${this.apiUrl}/types`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error obteniendo tipos:', error);
          return of([]);
        })
      );
  }

  getSuggestions(query: string): Observable<any> {
    const headers = { 'X-Api-Key': this.apiKey };
    const cleanQuery = query.replace(/"/g, '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Usamos una búsqueda más flexible y aumentamos el pageSize para mejores resultados
    const searchQuery = `name:"*${cleanQuery}*"`;
    return this.http.get(
      `${this.apiUrl}/cards?q=${encodeURIComponent(searchQuery)}&page=1&pageSize=20&select=name`,
      { headers }
    );
  }
}
