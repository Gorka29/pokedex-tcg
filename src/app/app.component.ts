import { Component } from '@angular/core';
import { CardListComponent } from "./components/card-list/card-list.component";
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CardListComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'pokedex-tcg';
  isDarkMode = false;

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', this.isDarkMode.toString());
    }
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode) {
        this.isDarkMode = savedMode === 'true';
      }
    }
  }
}
