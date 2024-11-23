import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PokemonService } from '../../services/pokemon.service';
import { RouterModule, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, FormsModule],
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.scss'
})

export class CardListComponent implements OnInit {
  loading = true;
  cards: any[] = [];
  currentPage: number = 1;
  searchQuery: string = '';
  sets: any[] = [];
  types: string[] = [];
  selectedSet: string = '';
  selectedType: string = '';
  noResults = false;
  suggestions: string[] = [];
  showSuggestions = false;

  constructor(
    private pokemonService: PokemonService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.loadSets();
    this.loadTypes();
    const savedState = this.pokemonService.getSearchState();
    this.searchQuery = savedState.query;
    this.currentPage = savedState.page;
    this.selectedSet = savedState.selectedSet;
    this.selectedType = savedState.selectedType;
    this.loadCards();
  }

  loadSets() {
    this.pokemonService.getSets().subscribe({
      next: (response) => {
        this.sets = response.data;
      },
      error: (error) => console.error('Error cargando sets:', error)
    });
  }

  loadTypes() {
    this.pokemonService.getTypes().subscribe({
      next: (types) => {
        this.types = types;
      },
      error: (error) => console.error('Error cargando tipos:', error)
    });
  }

  loadCards() {
    this.loading = true;
    this.noResults = false;
    return new Promise<void>((resolve) => {
      this.pokemonService.getCards(
        this.currentPage,
        16,
        encodeURIComponent(this.searchQuery),
        this.selectedSet,
        this.selectedType
      ).subscribe({
        next: (response) => {
          if (this.currentPage === 1) {
            this.cards = response.data;
            this.noResults = this.cards.length === 0;
          } else {
            this.cards = [...this.cards, ...response.data];
          }
          this.loading = false;
          resolve();
        },
        error: (error) => {
          console.error('Error:', error);
          this.loading = false;
          this.noResults = true;
          resolve();
        }
      });
    });
  }

  loadMore(): void {
    this.currentPage++;
    this.pokemonService.saveSearchState(
      this.searchQuery,
      this.currentPage,
      this.selectedSet,
      this.selectedType
    );
    this.loadCards();
  }

  navigateToCard(cardId: string) {
    this.pokemonService.saveSearchState(
      this.searchQuery,
      this.currentPage,
      this.selectedSet,
      this.selectedType
    );
    this.router.navigate(['/card', cardId]);
  }

  search(): void {
    this.currentPage = 1;
    this.cards = [];
    this.pokemonService.saveSearchState(
      this.searchQuery,
      this.currentPage,
      this.selectedSet,
      this.selectedType
    );
    this.loadCards();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedSet = '';
    this.selectedType = '';
    this.currentPage = 1;
    this.pokemonService.saveSearchState('', 1, '', '');
    this.loadCards();
  }

  getTypeIcon(type: string): string {
    const typeIcons: { [key: string]: string } = {
      'Colorless': '⚪',
      'Darkness': '🌑',
      'Dragon': '🐉',
      'Fairy': '🧚',
      'Fighting': '👊',
      'Fire': '🔥',
      'Grass': '🌿',
      'Lightning': '⚡',
      'Metal': '⚙️',
      'Psychic': '🔮',
      'Water': '💧'
    };

    return typeIcons[type] || '❓';
  }

  onSearchInput(event: any): void {
    const query = event.target.value.trim();
    if (query.length >= 2) {
      this.pokemonService.getSuggestions(query).subscribe({
        next: (response: { data: Array<{ name: string }> }) => {
          this.suggestions = [...new Set(
            response.data
              .map(card => card.name)
              .filter(name => {
                const normalizedName = name.toLowerCase();
                const normalizedQuery = query.toLowerCase();
                return normalizedName.includes(normalizedQuery);
              })
              .sort((a, b) => {
                const startsWithQuery = (name: string) =>
                  name.toLowerCase().startsWith(query.toLowerCase());
                return startsWithQuery(b) ? 1 : startsWithQuery(a) ? -1 : 0;
              })
          )].slice(0, 8);
          this.showSuggestions = this.suggestions.length > 0;
        },
        error: (error) => {
          console.error('Error en autocompletado:', error);
          this.suggestions = [];
          this.showSuggestions = false;
        }
      });
    } else {
      this.suggestions = [];
      this.showSuggestions = false;
    }
  }

  selectSuggestion(suggestion: string): void {
    this.searchQuery = suggestion;
    this.showSuggestions = false;
    this.search();
  }
}
