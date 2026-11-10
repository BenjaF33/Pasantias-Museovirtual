import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { InicioSesion } from './inicio-sesion';
import { AuthService } from '../../servicios/auth-service';

describe('InicioSesion', () => {
  let component: InicioSesion;
  let fixture: ComponentFixture<InicioSesion>;
  const auth = { login: vi.fn(), esAdmin: vi.fn() };

  beforeEach(async () => {
    auth.login.mockReturnValue(of({ token: 'jwt', usuario: { id_usuario: 1, nombre: 'Ana', rol: 'user' } }));
    auth.esAdmin.mockReturnValue(false);

    await TestBed.configureTestingModule({
      imports: [InicioSesion],
      providers: [
        provideRouter([{ path: 'inicio', component: InicioSesion }, { path: 'panel-admin', component: InicioSesion }]),
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InicioSesion);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('creates the login form', () => {
    expect(component).toBeTruthy();
  });

  it('logs in and navigates to the home page', () => {
    component.email = 'ana@example.com';
    component.clave = 'secret';
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.ingresar();

    expect(auth.login).toHaveBeenCalledWith('ana@example.com', 'secret');
    expect(navigateSpy).toHaveBeenCalledWith(['/inicio']);
  });
});
