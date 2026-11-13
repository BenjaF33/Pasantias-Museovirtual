import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bibliografia } from './bibliografia';

describe('Bibliografia', () => {
  let fixture: ComponentFixture<Bibliografia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bibliografia],
    }).compileComponents();

    fixture = TestBed.createComponent(Bibliografia);
    fixture.detectChanges();
  });

  it('shows the books and local references named by the museum content', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Conflicto social o pueblada');
    expect(text).toContain('Gitanos, una mirada que muchos no ven');
    expect(text).toContain('Ecos de la Historia');
    expect(text).toContain('CUPACIP');
  });
});
