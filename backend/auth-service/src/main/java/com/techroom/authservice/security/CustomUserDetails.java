    package com.techroom.authservice.security;

    import com.techroom.authservice.model.User;
    import lombok.AllArgsConstructor;
    import lombok.Data;
    import org.springframework.security.core.GrantedAuthority;
    import org.springframework.security.core.authority.SimpleGrantedAuthority;
    import org.springframework.security.core.userdetails.UserDetails;

    import java.util.Collection;
    import java.util.Collections;

    @Data
    @AllArgsConstructor
    public class CustomUserDetails implements UserDetails {

        private User user;

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            // Chuyển Enum Role thành Authority. Ví dụ: ADMIN -> ROLE_ADMIN
            return Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        }

        @Override
        public String getPassword() {
            return user.getPassword();
        }

        @Override
        public String getUsername() {
            return user.getUsername();
        }

        @Override
        public boolean isAccountNonExpired() {
            return true;
        }

        @Override
        public boolean isAccountNonLocked() {
            return true; // Có thể check user.getStatus() != BANNED nếu muốn chặt chẽ hơn
        }

        @Override
        public boolean isCredentialsNonExpired() {
            return true;
        }

        @Override
        public boolean isEnabled() {
            return true; // Có thể check user.getStatus() == ACTIVE
        }
    }