package com.example.invoices_service.service;

import com.example.invoices_service.config.VnPayConfig;
import com.example.invoices_service.entity.Invoice;
import com.example.invoices_service.repository.InvoiceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.stream.Collectors;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    private final InvoiceRepository invoiceRepository;
    private final VnPayConfig vnPayConfig;

    public Invoice createInvoice(Invoice request, BigDecimal rent, BigDecimal deposit) {
        if (invoiceRepository.existsByContractIdAndMonthAndYear(request.getContractId(), request.getMonth(), request.getYear())) {
            throw new RuntimeException("Hóa đơn cho tháng này đã tồn tại!");
        }

        long previousInvoices = invoiceRepository.countByContractId(request.getContractId());

        // Logic: Nếu chưa có hóa đơn nào -> Cộng thêm cọc
        BigDecimal finalAmount = (previousInvoices == 0) ? rent.add(deposit) : rent;
        String description = "Tiền phòng tháng " + request.getMonth() + "/" + request.getYear();
        if (previousInvoices == 0) description += " (Bao gồm tiền cọc)";

        request.setAmount(finalAmount);
        request.setDescription(description);
        request.setStatus("UNPAID");
        return invoiceRepository.save(request);
    }

    public String createPaymentUrl(Long invoiceId) throws Exception {
        Invoice invoice = invoiceRepository.findById(invoiceId).orElseThrow();

        String vnp_TxnRef = String.valueOf(invoice.getId());
        String vnp_OrderInfo = "Thanh toan hoa don #" + vnp_TxnRef;
        long amount = invoice.getAmount().multiply(new BigDecimal(100)).longValue();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", "127.0.0.1");

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));

        cld.add(Calendar.MINUTE, 15);
        vnp_Params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

        String queryUrl = vnp_Params.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.US_ASCII) + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.US_ASCII))
                .collect(Collectors.joining("&"));

        String vnp_SecureHash = vnPayConfig.hashAllFields(vnp_Params);
        return vnPayConfig.vnp_PayUrl + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;
    }

    @Transactional
    public void updatePaymentStatus(Long invoiceId, String code) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));

        // Chỉ cập nhật nếu hóa đơn chưa được thanh toán (để tránh xử lý trùng)
        if ("UNPAID".equals(invoice.getStatus())) {
            if ("00".equals(code)) {
                invoice.setStatus("PAID");
                System.out.println("DEBUG: Invoice " + invoiceId + " updated to PAID");
            } else {
                invoice.setStatus("FAILED");
                System.out.println("DEBUG: Invoice " + invoiceId + " updated to FAILED");
            }
            invoiceRepository.save(invoice);
        }
    }



}