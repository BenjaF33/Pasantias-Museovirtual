import { Routes } from '@angular/router';

// Info y ayuda
import { Nosotros } from './nosotros/nosotros';
import { Contacto } from './contacto/contacto';

// Auth
import { InicioSesion } from './Auth/inicio-sesion/inicio-sesion';
import { Registro } from './Auth/registro/registro';

import { Inicio } from './inicio/inicio';
import { Carrito } from './carrito/carrito';
import { Favoritos } from './favoritos/favoritos';
import { Bibliografia } from './bibliografia/bibliografia';
import { adminGuard } from './guard/admin-guard';
import { authGuard } from './guard/auth-guard';


export const routes: Routes = [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },

    { path: 'inicio', component: Inicio },
    { path: 'nosotros', component: Nosotros },
    { path: 'contacto', component: Contacto },
    { path: 'bibliografia', component: Bibliografia },
    { path: 'inicio-sesion', component: InicioSesion },
    { path: 'registro', component: Registro },
    { path: 'productos', loadComponent: () => import('./productos/productos').then(modulo => modulo.Productos) },
    { path: 'carrito', component: Carrito },
    { path: 'favoritos', component: Favoritos },
    { path: 'paginas/compra', canActivate: [authGuard], loadComponent: () => import('./compra/compra').then(modulo => modulo.Compra) },
    { path: 'mis-compras', canActivate: [authGuard], loadComponent: () => import('./compras/compras').then(modulo => modulo.Compras) },
    { path: 'paginas/ticket/:id', canActivate: [authGuard], loadComponent: () => import('./ticket/ticket').then(modulo => modulo.Ticket) },
    { path: 'panel-admin', canActivate: [adminGuard], loadComponent: () => import('./admin/admin').then(modulo => modulo.Admin) },
    { path: '**', redirectTo: 'inicio' },
];
