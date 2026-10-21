import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Nosotros } from './nosotros/nosotros';
import { Contacto } from './contacto/contacto';
import { InicioSesion } from './Auth/inicio-sesion/inicio-sesion';
import { Registro } from './Auth/registro/registro';
import { Productos } from './productos/productos';
import { Favoritos } from './favoritos/favoritos';





export const routes: Routes = [
    { path: '', redirectTo: 'inicio', pathMatch: 'full' },

    { path: 'inicio', component: Inicio },
    { path: 'nosotros', component: Nosotros },
    { path: 'contacto', component: Contacto },
    { path: 'inicio-sesion', component: InicioSesion },
    { path: 'registro', component: Registro },
    { path: 'productos', component: Productos },
    { path: 'favoritos', component: Favoritos },


    { path: '**', redirectTo: 'inicio' },
];
