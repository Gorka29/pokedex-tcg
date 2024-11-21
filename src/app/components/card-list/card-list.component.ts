import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { PokemonService } from '../../services/pokemon.service';
import { RouterModule, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-card-list',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './card-list.component.html',
  styleUrl: './card-list.component.scss'
})

export class CardListComponent implements OnInit {
  loading = true;
  cards: any[] = [];

  currentPage: number = 1;

  constructor(
    private pokemonService: PokemonService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.loadCards();
  }

  loadCards() {
    this.loading = true;
    this.pokemonService.getCards().subscribe({
      next: (response) => {
        this.cards = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.loading = false;
      }
    });
  }

  loadMore(): void {
    this.currentPage++;
    this.pokemonService.getCards(this.currentPage).subscribe((data) => {
      this.cards = [...this.cards, ...data.data];
    });
  }

  navigateToCard(cardId: string) {
    this.router.navigate(['/card', cardId]);
  }

}
