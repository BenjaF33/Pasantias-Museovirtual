import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Contacto } from './contacto';

describe('Contacto', () => {
  let component: Contacto;
  let fixture: ComponentFixture<Contacto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contacto],
    }).compileComponents();

    fixture = TestBed.createComponent(Contacto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the contact fields and clearly show that sending is unavailable', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('#contacto-nombre')).not.toBeNull();
    expect(element.querySelector('#contacto-email')).not.toBeNull();
    expect(element.querySelector('#contacto-mensaje')).not.toBeNull();
    expect(element.querySelector<HTMLButtonElement>('button')?.disabled).toBe(true);
    expect(element.textContent).toContain('el contenido de este formulario no se enviará');
  });
});
