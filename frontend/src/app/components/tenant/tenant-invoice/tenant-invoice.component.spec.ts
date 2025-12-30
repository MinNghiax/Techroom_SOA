import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantInvoiceComponent } from './tenant-invoice.component';

describe('TenantInvoiceComponent', () => {
  let component: TenantInvoiceComponent;
  let fixture: ComponentFixture<TenantInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantInvoiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
