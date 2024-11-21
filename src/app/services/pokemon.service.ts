import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private apiUrl = 'https://api.pokemontcg.io/v2'; // Base URL de la API
  private apiKey = '0315c841-fde4-47f9-beac-80067a4c1951'; // Reemplaza con tu clave de API

  constructor(private http: HttpClient) {}

  getCards(page: number = 1, pageSize: number = 16): Observable<any> {
    const headers = { 'X-Api-Key': this.apiKey };
    return this.http.get(`${this.apiUrl}/cards?page=${page}&pageSize=${pageSize}`, { headers });
  }

  getCardById(id: string): Observable<any> {
    const headers = { 'X-Api-Key': this.apiKey };
    return this.http.get(`${this.apiUrl}/cards/${id}`, { headers });
  }
}
