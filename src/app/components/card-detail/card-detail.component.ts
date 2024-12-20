import { Component, OnInit, inject } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-card-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-detail.component.html',
  styleUrl: './card-detail.component.scss'
})
export class CardDetailComponent implements OnInit {

  card: any;
  loading = true;
  error = false;

  private document = inject(DOCUMENT);

  constructor(
    private route: ActivatedRoute,
    private pokemonService: PokemonService,
    private location: Location
  ){}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pokemonService.getCardById(id).subscribe({
        next: (response) => {
          this.card = response.data;
          this.loading = false;
        },
        error: (error) => {
          this.error = true;
          this.loading = false;
          console.error('Error fetching card:', error);
        }
      });
    }
  }

  goBack(): void {
    this.location.back();
  }
}
