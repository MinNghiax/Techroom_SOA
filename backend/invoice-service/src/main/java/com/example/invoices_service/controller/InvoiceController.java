package com.example.invoices_service.controller;

import com.example.invoices_service.entity.Invoice;
import com.example.invoices_service.service.InvoiceService;
import com.example.invoices_service.repository.InvoiceRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@CrossOrigin("*") // Cho phép Angular gọi API
public class InvoiceController {
    private final InvoiceService invoiceService;
    private final InvoiceRepository invoiceRepository;

    @PostMapping("/create")
    public Invoice create(@RequestBody Invoice invoice,
                          @RequestParam BigDecimal rent,
                          @RequestParam BigDecimal deposit) {
        return invoiceService.createInvoice(invoice, rent, deposit);
    }

    @GetMapping("/landlord/{id}")
    public List<Invoice> getByLandlord(@PathVariable Long id) {
        return invoiceRepository.findByLandlordId(id);
    }

    @GetMapping("/tenant/{id}")
    public List<Invoice> getByTenant(@PathVariable Long id) {
        return invoiceRepository.findByTenantId(id);
    }

    @GetMapping("/{id}/pay-url")
    public Map<String, String> getPayUrl(@PathVariable Long id) throws Exception {
        return Map.of("url", invoiceService.createPaymentUrl(id));
    }


    @GetMapping("/verify")
    public void verify(@RequestParam Long invoiceId, @RequestParam String code) {
        // Đảm bảo invoiceService.updatePaymentStatus có thực hiện repository.save()
        invoiceService.updatePaymentStatus(invoiceId, code);
    }

    // InvoiceController.java

    @PutMapping("/{id}")
    public Invoice update(@PathVariable Long id, @RequestBody Invoice updatedInvoice) {
        return invoiceRepository.findById(id).map(invoice -> {
            invoice.setAmount(updatedInvoice.getAmount());
            invoice.setMonth(updatedInvoice.getMonth());
            invoice.setYear(updatedInvoice.getYear());
            invoice.setStatus(updatedInvoice.getStatus());
            return invoiceRepository.save(invoice);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        invoiceRepository.deleteById(id);
    }
    
    @GetMapping("/vnpay-callback")
    public void vnpayCallback(
            @RequestParam Map<String, String> queryParams,
            HttpServletResponse response) throws IOException {

        // vnp_TxnRef chính là invoiceId bạn đã truyền vào khi tạo URL
        String txnRef = queryParams.get("vnp_TxnRef");
        String responseCode = queryParams.get("vnp_ResponseCode");

        if (txnRef != null && responseCode != null) {
            Long invoiceId = Long.parseLong(txnRef);

            // Cập nhật vào DB thông qua Service đã viết
            invoiceService.updatePaymentStatus(invoiceId, responseCode);

            // Sau khi cập nhật DB xong, Redirect người dùng về lại trang giao diện Angular
            // Thêm tham số status để Frontend hiển thị thông báo alert nếu muốn
            String frontendUrl = "http://localhost:4200/landlord/invoices?vnp_ResponseCode=" + responseCode;
            response.sendRedirect(frontendUrl);
        }
    }
}
