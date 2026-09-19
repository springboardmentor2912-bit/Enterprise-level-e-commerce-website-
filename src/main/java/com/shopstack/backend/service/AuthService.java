package com.shopstack.backend.service;

import com.shopstack.backend.dto.LoginRequest;
import com.shopstack.backend.dto.LoginResponse;
import com.shopstack.backend.dto.RegisterRequest;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.enums.Role;
import com.shopstack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    public String register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "Email already exists";
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        String requestedRole = request.getRole();

        if (requestedRole == null ||
                (!requestedRole.equalsIgnoreCase("CUSTOMER") &&
                        !requestedRole.equalsIgnoreCase("VENDOR"))) {

            return "Invalid registration role";
        }

        user.setRole(Role.valueOf(requestedRole.toUpperCase()));

        userRepository.save(user);

        return "Registration Successful";
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException("Invalid Password");
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(
                token,
                user.getRole().name()
        );
    }
}