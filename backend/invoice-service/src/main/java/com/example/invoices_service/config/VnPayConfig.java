package com.example.invoices_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Configuration
public class VnPayConfig {
    @Value("${vnp.url}") public String vnp_PayUrl;
    @Value("${vnp.returnUrl}") public String vnp_ReturnUrl;
    @Value("${vnp.tmnCode}") public String vnp_TmnCode;
    @Value("${vnp.hashSecret}") public String vnp_HashSecret;

    public String hmacSHA512(final String key, final String data) {
        try {
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            final SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) sb.append(String.format("%02x", b & 0xff));
            return sb.toString();
        } catch (Exception ex) { return ""; }
    }

    public String hashAllFields(Map<String, String> fields) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                sb.append(fieldName).append("=").append(java.net.URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) sb.append("&");
            }
        }
        return hmacSHA512(vnp_HashSecret, sb.toString());
    }
}
