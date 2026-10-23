import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';

import { adminGuard } from './admin-guard';
import { AuthService } from '../servicios/auth-service';

describe('adminGuard', () => {
  const auth = {
    estaLogueado: vi.fn(),
    esAdmin: vi.fn(),
  };

  beforeEach(() => {
    auth.estaLogueado.mockReturnValue(true);
    auth.esAdmin.mockReturnValue(true);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
      ],
    });
  });

  function executeGuard() {
    return TestBed.runInInjectionContext(() =>
      adminGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  }

  it('allows logged-in administrators', () => {
    expect(executeGuard()).toBe(true);
  });

  it('redirects users who are not logged in to the home page', () => {
    auth.estaLogueado.mockReturnValue(false);

    const result = executeGuard();
    const router = TestBed.inject(Router);

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/inicio');
  });

  it('redirects logged-in non-administrators to the home page', () => {
    auth.esAdmin.mockReturnValue(false);

    const result = executeGuard();
    const router = TestBed.inject(Router);

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/inicio');
  });
});
