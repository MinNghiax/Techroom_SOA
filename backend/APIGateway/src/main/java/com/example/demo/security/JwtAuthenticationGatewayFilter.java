package com.example.demo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtAuthenticationGatewayFilter implements GlobalFilter, Ordered {
    @Value("${jwt.secret}")
    private String jwtSecret;

    // Danh sách endpoint public cho FE (không cần JWT)
    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/login",
            "/api/auth/register"
    );

    private boolean isPublicEndpoint(ServerHttpRequest request) {
        String path = request.getURI().getPath();
        String method = request.getMethod() != null ? request.getMethod().name() : "";

        if (path.contains("/vnpay-callback") || path.contains("/vnpay-ipn")) {
            return true;
        }
        // GET các endpoint public
        if ("GET".equalsIgnoreCase(method)) {
            // 1. ƯU TIÊN KIỂM TRA: Nếu là đường dẫn quản lý thì KHÔNG phải public
            if (path.contains("/landlord")) {
                return false;
            }

            // 2. CHẤP NHẬN: Các đường dẫn xem thông tin công khai
            if (path.startsWith("/api/rooms/images")    // Cho phép hiện ảnh phòng
                    || path.startsWith("/api/locations")
                    || path.startsWith("/api/rooms/amenities")
                    || path.startsWith("/api/reviews")
                    || path.equals("/api/rooms")        // Danh sách phòng trang chủ
                    || path.matches("/api/rooms/\\d+")
                    || path.equals("/api/buildings")
                    || path.matches("/api/buildings/\\d+")) {
                return true;
            }
        }

        // Các path public khác (login, register)
        return PUBLIC_PATHS.stream().anyMatch(path::equals);
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        if (isPublicEndpoint(request)) {
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange);
        }

        String token = authHeader.substring(7);
        SecretKey secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        Claims claims;
        try {
            claims = Jwts.parserBuilder()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return unauthorized(exchange);
        }

        String userId = String.valueOf(claims.get("userId"));
        String role = claims.get("role", String.class);

        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-User-Id", userId)
                .header("X-User-Role", role)
                .build();
        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return response.setComplete();
    }

    @Override
    public int getOrder() {
        return -1;
    }
}