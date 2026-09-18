package com.shopstack.security;

import com.shopstack.entity.User;
import com.shopstack.enums.Role;
import com.shopstack.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Fires after a successful Google OAuth2 login. Finds-or-creates a local User
 * record, issues our own JWT, and redirects to the SPA with the token as a
 * query param so the frontend can pick it up and store it.
 */
@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        User user = userRepository.findByEmail(email).orElseGet(() -> userRepository.save(
                User.builder()
                        .email(email)
                        .fullName(name != null ? name : email)
                        .role(Role.CUSTOMER)
                        .oauthUser(true)
                        .enabled(true)
                        .build()
        ));

        UserPrincipal principal = new UserPrincipal(user);
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());
        String token = jwtService.generateAccessToken(principal, claims);

        getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/oauth2/callback?token=" + token);
    }
}
