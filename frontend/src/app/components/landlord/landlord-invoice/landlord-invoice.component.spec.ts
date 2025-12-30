import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandlordInvoiceComponent } from './landlord-invoice.component';

describe('LandlordInvoiceComponent', () => {
  let component: LandlordInvoiceComponent;
  let fixture: ComponentFixture<LandlordInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandlordInvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandlordInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
