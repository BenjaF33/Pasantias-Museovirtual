import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Inicio } from './inicio';

describe('Inicio', () => {
  let component: Inicio;
  let fixture: ComponentFixture<Inicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inicio],
    }).compileComponents();

    fixture = TestBed.createComponent(Inicio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows carousel arrows only when there is more than one image', () => {
    component.mostrarInfo({ anio: '1881', titulo: 'Tendido telegráfico', img: ['imagen-1.jpg'] });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.carousel-control-prev').length).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('.carousel-control-next').length).toBe(0);

    component.mostrarInfo({ anio: '1879', titulo: 'Fuerte Confluencia', img: ['imagen-1.jpg', 'imagen-2.jpg'] });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.carousel-control-prev').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.carousel-control-next').length).toBe(1);
  });
});
