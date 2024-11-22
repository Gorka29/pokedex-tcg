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
  isRestoringPosition = false;
  sets: any[] = [];
  types: string[] = [];
  selectedSet: string = '';
  selectedType: string = '';
  noResults = false;

  constructor(
    private pokemonService: PokemonService,
    private router: Router) {
    this.types = this.pokemonService.getTypes();
  }

  ngOnInit(): void {
    this.loadSets();
    const savedState = this.pokemonService.getSearchState();
    this.searchQuery = savedState.query;
    this.currentPage = savedState.page;
    this.selectedSet = savedState.selectedSet;
    this.selectedType = savedState.selectedType;
    this.loadAllPages(savedState.page, savedState.scrollPosition);
  }

  loadSets() {
    this.pokemonService.getSets().subscribe({
      next: (response) => {
        this.sets = response.data;
      },
      error: (error) => console.error('Error cargando sets:', error)
    });
  }

  async loadAllPages(targetPage: number, savedScrollPosition: number) {
    this.loading = true;
    this.isRestoringPosition = true;

    for (let page = 1; page <= targetPage; page++) {
      await new Promise<void>((resolve) => {
        this.pokemonService.getCards(page, 16, this.searchQuery, this.selectedSet, this.selectedType).subscribe({
          next: (response) => {
            if (page === 1) {
              this.cards = response.data;
            } else {
              this.cards = [...this.cards, ...response.data];
            }
            resolve();
          },
          error: (error) => {
            console.error('Error:', error);
            resolve();
          }
        });
      });
    }

    if (savedScrollPosition) {
      const checkAndScroll = () => {
        window.scrollTo({
          top: savedScrollPosition,
          behavior: 'auto'
        });
      };

      setTimeout(checkAndScroll, 100);
      setTimeout(checkAndScroll, 500);
      setTimeout(checkAndScroll, 1000);
      setTimeout(checkAndScroll, 1500);
      setTimeout(checkAndScroll, 2000);

      setTimeout(() => {
        checkAndScroll();
        setTimeout(() => {
          this.isRestoringPosition = false;
          this.loading = false;
        }, 500);
      }, 2500);
    } else {
      this.isRestoringPosition = false;
      this.loading = false;
    }
  }

  loadCards() {
    this.loading = true;
    this.noResults = false;
    return new Promise<void>((resolve) => {
      this.pokemonService.getCards(
        this.currentPage,
        16,
        this.searchQuery,
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
          setTimeout(() => {
            resolve();
          }, 100);
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
    const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    this.pokemonService.saveSearchState(
      this.searchQuery,
      this.currentPage,
      scrollPosition,
      this.selectedSet,
      this.selectedType
    );
    this.loadCards();
  }

  navigateToCard(cardId: string) {
    // Capturar la posición del scroll antes de navegar
    const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
    console.log('Guardando posición del scroll:', scrollPosition);

    this.pokemonService.saveSearchState(
      this.searchQuery,
      this.currentPage,
      scrollPosition,
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
      0,
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
    this.pokemonService.saveSearchState('', 1, 0, '', '');
    this.loadCards();
  }
}
