import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Nosotros } from './nosotros/nosotros';
import { Contacto } from './contacto/contacto';
import { Productos } from './productos/productos';




export const routes: Routes = [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },

    { path: 'inicio', component: Inicio },
    { path: 'nosotros', component: Nosotros },
    { path: 'contacto', component: Contacto },
    { path: 'productos', component: Productos },


    { path: '**', redirectTo: 'inicio' },
];
