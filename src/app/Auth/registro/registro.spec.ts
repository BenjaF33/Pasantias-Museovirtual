import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Registro } from './registro';
import { AuthService } from '../../servicios/auth-service';

describe('Registro', () => {
  let component: Registro;
  let fixture: ComponentFixture<Registro>;
  const auth = { registro: vi.fn() };

  beforeEach(async () => {
    auth.registro.mockReturnValue(of({ mensaje: 'Usuario registrado' }));
    await TestBed.configureTestingModule({
      imports: [Registro],
      providers: [
        provideRouter([{ path: 'inicio-sesion', component: Registro }]),
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Registro);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('creates the registration form', () => {
    expect(component).toBeTruthy();
  });

  it('sends the API password field and the entered name', () => {
    component.nombre = 'Ana';
    component.email = 'ana@example.com';
    component.clave = 'secret';

    component.registrar();

    expect(auth.registro).toHaveBeenCalledWith({
      nombre: 'Ana',
      email: 'ana@example.com',
      contraseña: 'secret',
    });
  });
});
