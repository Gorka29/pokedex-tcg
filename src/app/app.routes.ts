import { Routes } from '@angular/router';
import { CardDetailComponent } from './components/card-detail/card-detail.component';
import { CardListComponent } from './components/card-list/card-list.component';

export const routes: Routes = [
  { path: '', component: CardListComponent },
  { path: 'card/:id', component: CardDetailComponent },
  { path: '**', redirectTo: '' }
];
