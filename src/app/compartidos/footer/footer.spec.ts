import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Footer } from './footer';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('links to the bibliography page', () => {
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const identidad = fixture.nativeElement.querySelector('.footer-identidad') as HTMLElement;

    expect(link.textContent).toContain('Bibliografía');
    expect(link.getAttribute('href')).toBe('/bibliografia');
    expect(identidad.textContent).toContain('Museo Virtual');
    expect(identidad.contains(link)).toBe(true);
  });
});
