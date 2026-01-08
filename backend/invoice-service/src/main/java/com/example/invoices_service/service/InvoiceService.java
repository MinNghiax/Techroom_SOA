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

    @Transactional
    public Invoice updateInvoice(Long id, Invoice updatedInvoice) {
        return invoiceRepository.findById(id).map(invoice -> {
            // Chặn chỉnh sửa nếu đã thanh toán
            if ("PAID".equals(invoice.getStatus())) {
                throw new RuntimeException("Hóa đơn đã thanh toán, không thể chỉnh sửa!");
            }
            invoice.setAmount(updatedInvoice.getAmount());
            invoice.setMonth(updatedInvoice.getMonth());
            invoice.setYear(updatedInvoice.getYear());
            invoice.setStatus(updatedInvoice.getStatus());
            return invoiceRepository.save(invoice);
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn có ID: " + id));
    }

    @Transactional
    public void deleteInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn có ID: " + id));

        // Chặn xóa nếu đã thanh toán
        if ("PAID".equals(invoice.getStatus())) {
            throw new RuntimeException("Hóa đơn đã thanh toán, không thể xóa!");
        }
        invoiceRepository.delete(invoice);
    }

    public String createPaymentUrl(Long invoiceId) throws Exception {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn"));

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

        if ("UNPAID".equals(invoice.getStatus()) || "FAILED".equals(invoice.getStatus())) {
            invoice.setStatus("00".equals(code) ? "PAID" : "FAILED");
            invoiceRepository.save(invoice);
        }
    }

    @Transactional
    public String processVnPayCallback(Map<String, String> fields) {
        // 1. Kiểm tra Checksum (Chữ ký)
        String vnp_SecureHash = fields.get("vnp_SecureHash");
        // Tạo bản sao để tính toán hash (không bao gồm hash cũ)
        Map<String, String> hashFields = new HashMap<>(fields);
        hashFields.remove("vnp_SecureHash");
        hashFields.remove("vnp_SecureHashType");

        String signValue = vnPayConfig.hashAllFields(hashFields);

        if (!signValue.equals(vnp_SecureHash)) {
            return "invalid_signature";
        }

        // 2. Kiểm tra Hóa đơn
        Long invoiceId = Long.parseLong(fields.get("vnp_TxnRef"));
        Invoice invoice = invoiceRepository.findById(invoiceId).orElse(null);
        if (invoice == null) return "order_not_found";

        // 3. Kiểm tra số tiền (Tránh bị hack đổi số tiền khi thanh toán)
        long vnp_Amount = Long.parseLong(fields.get("vnp_Amount")) / 100;
        if (invoice.getAmount().longValue() != vnp_Amount) return "invalid_amount";

        // 4. Kiểm tra trạng thái và Cập nhật
        if ("00".equals(fields.get("vnp_ResponseCode"))) {
            if ("PAID".equals(invoice.getStatus())) return "already_confirmed";
            invoice.setStatus("PAID");
        } else {
            invoice.setStatus("FAILED");
        }

        invoiceRepository.save(invoice);
        return "success";
    }



}