import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';

import { Nav } from './nav';
import { AuthService } from '../../servicios/auth-service';
import { TemaService } from '../../servicios/tema';

describe('Nav', () => {
  let component: Nav;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nav],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { estaLogueado: () => false, esAdmin: () => false } },
        { provide: TemaService, useValue: { modoOscuro: signal(false), alternar: vi.fn() } },
      ],
    }).compileComponents();
  });

  it('creates the navigation component', () => {
    const fixture: ComponentFixture<Nav> = TestBed.createComponent(Nav);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('shows login and registration links when there is no session', () => {
    const fixture = TestBed.createComponent(Nav);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ingresar');
    expect(fixture.nativeElement.textContent).toContain('Registrarse');
    expect(fixture.nativeElement.textContent).not.toContain('Panel admin');
  });
});
