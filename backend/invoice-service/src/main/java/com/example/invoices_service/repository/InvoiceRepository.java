package com.example.invoices_service.repository;

import com.example.invoices_service.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByTenantId(Long tenantId);
    List<Invoice> findByLandlordId(Long landlordId);
    long countByContractId(Long contractId);
    boolean existsByContractIdAndMonthAndYear(Long contractId, int month, int year);
}
