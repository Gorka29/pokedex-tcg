import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PokemonService } from '../../services/pokemon.service';
import { RouterModule, Router, RouterLink } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
  selectedRarity: string = '';
  hpRange: { min: number } = {
    min: 0
  };
  rarities: string[] = [];
  hpRangeError: string = '';
  showOnlyFavorites: boolean = false;
  hpMinOptions: number[] = [];
  totalCount: number = 0;

  constructor(
    private pokemonService: PokemonService,
    private favoritesService: FavoritesService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadSets();
      this.loadTypes();
      this.loadRarities();
      const savedState = this.pokemonService.getSearchState();
      this.searchQuery = savedState.query;
      this.currentPage = savedState.page;
      this.selectedSet = savedState.selectedSet;
      this.selectedType = savedState.selectedType;
      this.selectedRarity = savedState.selectedRarity;
      this.hpRange = savedState.hpRange || { min: 0 };
      this.loadCards();
      this.generateHpOptions();
    }
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

  loadRarities() {
    this.pokemonService.getRarities().subscribe({
      next: (rarities) => {
        this.rarities = rarities;
      },
      error: (error) => console.error('Error cargando rarezas:', error)
    });
  }

  loadCards() {
    this.loading = true;
    this.noResults = false;

    return new Promise<void>((resolve) => {
      if (this.showOnlyFavorites) {
        const favorites = this.favoritesService.getFavorites();

        if (favorites.length === 0) {
          this.loading = false;
          this.noResults = true;
          this.cards = [];
          this.totalCount = 0;
          resolve();
          return;
        }

        this.pokemonService.getCardsByIds(
          favorites,
          this.searchQuery,
          this.selectedSet,
          this.selectedType,
          this.selectedRarity,
          this.hpRange
        ).subscribe({
          next: (cards) => {
            this.cards = cards;
            this.noResults = this.cards.length === 0;
            this.totalCount = cards.length;
            this.loading = false;
            resolve();
          },
          error: (error) => {
            console.error('Error loading favorite cards:', error);
            this.loading = false;
            this.noResults = true;
            resolve();
          }
        });
      } else {
        this.pokemonService.getCards(
          this.currentPage,
          16,
          encodeURIComponent(this.searchQuery),
          this.selectedSet,
          this.selectedType,
          this.selectedRarity,
          this.hpRange
        ).subscribe({
          next: (response) => {
            if (this.currentPage === 1) {
              this.cards = response.data;
            } else {
              this.cards = [...this.cards, ...response.data];
            }
            this.noResults = this.cards.length === 0;
            this.totalCount = response.totalCount;
            this.loading = false;
            resolve();
          },
          error: (error) => {
            console.error('Error loading cards:', error);
            this.loading = false;
            this.noResults = true;
            resolve();
          }
        });
      }
    });
  }

  loadMore(): void {
    this.currentPage++;
    this.pokemonService.saveSearchState(
      this.searchQuery,
      this.currentPage,
      this.selectedSet,
      this.selectedType,
      this.selectedRarity,
      this.hpRange
    );
    this.loadCards();
  }

  navigateToCard(cardId: string) {
    this.pokemonService.saveSearchState(
      this.searchQuery,
      this.currentPage,
      this.selectedSet,
      this.selectedType,
      this.selectedRarity,
      this.hpRange
    );
    this.router.navigate(['/card', cardId]);
  }

  validateHpRange(): boolean {
    return true;
  }

  search(): void {
    this.currentPage = 1;
    this.cards = [];
    this.pokemonService.saveSearchState(
      this.searchQuery,
      this.currentPage,
      this.selectedSet,
      this.selectedType,
      this.selectedRarity,
      this.hpRange
    );
    this.loadCards();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedSet = '';
    this.selectedType = '';
    this.selectedRarity = '';
    this.hpRange.min = 0;
    this.currentPage = 1;
    this.pokemonService.clearSearchState();
    window.location.reload();
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

  toggleFavorite(event: Event, cardId: string): void {
    event.stopPropagation(); // Evitar navegación a la carta
    if (this.favoritesService.isFavorite(cardId)) {
      this.favoritesService.removeFromFavorites(cardId);
    } else {
      this.favoritesService.addToFavorites(cardId);
    }
  }

  isFavorite(cardId: string): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return this.favoritesService.isFavorite(cardId);
    }
    return false;
  }

  toggleFavoritesFilter(): void {
    this.showOnlyFavorites = !this.showOnlyFavorites;
    this.currentPage = 1;
    this.cards = [];
    this.loadCards();
  }

  generateHpOptions() {
    for (let i = 0; i <= 300; i += 10) {
      this.hpMinOptions.push(i);
    }
  }

  hasMoreResults(): boolean {
    return this.cards.length < this.totalCount;
  }
}
