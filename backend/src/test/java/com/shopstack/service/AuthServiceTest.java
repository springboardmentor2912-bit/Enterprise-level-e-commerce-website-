package com.shopstack.service;

import com.shopstack.dto.AuthResponse;
import com.shopstack.dto.LoginRequest;
import com.shopstack.dto.RegisterRequest;
import com.shopstack.model.Role;
import com.shopstack.repository.UserRepository;
import com.shopstack.repository.VendorProfileRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VendorProfileRepository vendorProfileRepository;

    @Test
    @DisplayName("1.1 Customer Registration - Success")
    void testCustomerRegistration_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("John Doe Customer");
        request.setEmail("john.doe@test.com");
        request.setPassword("Password@123");
        request.setPhoneNumber("+1-555-9876");
        request.setRole(Role.CUSTOMER);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        assertEquals("john.doe@test.com", response.getEmail());
        assertEquals(Role.CUSTOMER, response.getRole());
        assertTrue(userRepository.existsByEmail("john.doe@test.com"));
    }

    @Test
    @DisplayName("1.2 Vendor Registration - Auto-creates VendorProfile")
    void testVendorRegistration_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Apex Electronics Owner");
        request.setEmail("apex.vendor@test.com");
        request.setPassword("VendorPass@123");
        request.setPhoneNumber("+1-555-5555");
        request.setRole(Role.VENDOR);
        request.setStoreName("Apex High-Tech Hub");
        request.setStoreDescription("Flagship electronics and smart gear");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals(Role.VENDOR, response.getRole());
        assertNotNull(response.getVendorProfileId());
        assertEquals("Apex High-Tech Hub", response.getStoreName());

        assertTrue(vendorProfileRepository.findByUserId(response.getId()).isPresent());
    }

    @Test
    @DisplayName("1.3 Duplicate Email Registration - Rejection")
    void testDuplicateEmailRegistration_ThrowsException() {
        RegisterRequest request1 = new RegisterRequest();
        request1.setFullName("Original User");
        request1.setEmail("duplicate@test.com");
        request1.setPassword("Pass@123");
        request1.setRole(Role.CUSTOMER);
        authService.register(request1);

        RegisterRequest request2 = new RegisterRequest();
        request2.setFullName("Duplicate User");
        request2.setEmail("duplicate@test.com");
        request2.setPassword("Pass@456");
        request2.setRole(Role.CUSTOMER);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.register(request2));
        assertTrue(exception.getMessage().contains("already registered"));
    }

    @Test
    @DisplayName("1.4 Valid Login - Returns JWT Token and User Profile")
    void testValidLogin_Success() {
        LoginRequest loginRequest = new LoginRequest("admin@shopstack.com", "admin123");
        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertNotNull(response.getAccessToken());
        assertEquals("admin@shopstack.com", response.getEmail());
        assertEquals(Role.ADMIN, response.getRole());
    }

    @Test
    @DisplayName("1.5 Invalid Login - Bad Password Rejection")
    void testInvalidLogin_BadPassword_ThrowsException() {
        LoginRequest loginRequest = new LoginRequest("admin@shopstack.com", "WRONG_PASSWORD_XYZ");
        assertThrows(BadCredentialsException.class, () -> authService.login(loginRequest));
    }

    @Test
    @DisplayName("1.6 Invalid Login - Unknown User Rejection")
    void testInvalidLogin_UnknownUser_ThrowsException() {
        LoginRequest loginRequest = new LoginRequest("nonexistent_user@shopstack.com", "random_pass");
        assertThrows(BadCredentialsException.class, () -> authService.login(loginRequest));
    }

    @Test
    @DisplayName("1.7 Forgot Password - Clean Non-leaking Response")
    void testForgotPassword_AlwaysReturnsUserFriendlyMessage() {
        Map<String, String> responseKnown = authService.forgotPassword("admin@shopstack.com");
        assertNotNull(responseKnown);
        assertTrue(responseKnown.get("message").contains("reset link"));

        Map<String, String> responseUnknown = authService.forgotPassword("unknown_random_email@shopstack.com");
        assertNotNull(responseUnknown);
        assertTrue(responseUnknown.get("message").contains("reset link"));
    }
}
