import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./modules/planet-list/planet-list.component').then(c => c.PlanetListComponent)
  },
  {
    path: 'planet-details/:id',
    loadComponent: () =>
      import('./modules/planet-details/planet-details.component').then(c => c.PlanetDetailsComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
