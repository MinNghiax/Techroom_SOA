package com.example.invoices_service.controller;

import com.example.invoices_service.entity.Invoice;
import com.example.invoices_service.service.InvoiceService;
import com.example.invoices_service.repository.InvoiceRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.HashMap;
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

    @PutMapping("/{id}")
    public Invoice update(@PathVariable Long id, @RequestBody Invoice updatedInvoice) {
        return invoiceService.updateInvoice(id, updatedInvoice);
    }

    // Thay đổi logic xóa: Gọi qua Service
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
    }

    @GetMapping("/{id}/pay-url")
    public Map<String, String> getPayUrl(@PathVariable Long id) throws Exception {
        return Map.of("url", invoiceService.createPaymentUrl(id));
    }

    /**
     * LUỒNG 1: RETURN URL (Xử lý khi trình duyệt của User redirect về)
     * Nhiệm vụ: Xử lý dữ liệu và đưa người dùng về giao diện Frontend.
     */
    @GetMapping("/vnpay-return")
    public void vnpayReturn(@RequestParam Map<String, String> queryParams,
                            HttpServletResponse response) throws IOException {

        // Gọi service xử lý chung (kiểm tra checksum, update status)
        invoiceService.processVnPayCallback(queryParams);

        String responseCode = queryParams.get("vnp_ResponseCode");
        // Redirect về Angular kèm status để hiện thông báo cho User
        String frontendUrl = "http://localhost:4200/landlord/invoices?payment_status=" + responseCode;
        response.sendRedirect(frontendUrl);
    }

    /**
     * LUỒNG 2: IPN URL (VNPay Server-to-Server)
     * Nhiệm vụ: Đảm bảo dữ liệu được cập nhật dù User có tắt trình duyệt.
     * VNPay yêu cầu phản hồi JSON đúng định dạng RspCode.
     */
    @GetMapping("/vnpay-ipn")
    public Map<String, String> vnpayIpn(@RequestParam Map<String, String> queryParams) {
        // Sử dụng chung hàm xử lý logic với luồng Return
        String result = invoiceService.processVnPayCallback(queryParams);

        Map<String, String> response = new HashMap<>();
        if ("success".equals(result) || "already_confirmed".equals(result)) {
            response.put("RspCode", "00");
            response.put("Message", "Confirm Success");
        } else if ("order_not_found".equals(result)) {
            response.put("RspCode", "01");
            response.put("Message", "Order not found");
        } else if ("invalid_signature".equals(result)) {
            response.put("RspCode", "97");
            response.put("Message", "Invalid Checksum");
        } else {
            response.put("RspCode", "99");
            response.put("Message", "Unknown Error");
        }
        return response;
    }
}
