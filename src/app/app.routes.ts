import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Nosotros } from './nosotros/nosotros';




export const routes: Routes = [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },

    { path: 'inicio', component: Inicio },
    { path: 'nosotros', component: Nosotros },


    { path: '**', redirectTo: 'inicio' },
];
