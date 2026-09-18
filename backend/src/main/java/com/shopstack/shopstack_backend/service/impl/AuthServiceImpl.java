package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.constant.RoleName;
import com.shopstack.shopstack_backend.dto.request.LoginRequest;
import com.shopstack.shopstack_backend.dto.request.RegisterRequest;
import com.shopstack.shopstack_backend.dto.response.LoginResponse;
import com.shopstack.shopstack_backend.dto.response.UserResponse;
import com.shopstack.shopstack_backend.entity.Role;
import com.shopstack.shopstack_backend.entity.User;
import com.shopstack.shopstack_backend.repository.RoleRepository;
import com.shopstack.shopstack_backend.repository.UserRepository;
import com.shopstack.shopstack_backend.security.jwt.JwtService;
import com.shopstack.shopstack_backend.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public UserResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Phone number already exists");
        }

        Role role = roleRepository.findByRoleName(RoleName.ROLE_CUSTOMER)
                .orElseThrow(() -> new RuntimeException("Customer role not found"));

        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEnabled(true);
        user.setRole(role);

        User savedUser = userRepository.save(user);

        UserResponse response = new UserResponse();
        response.setId(savedUser.getId());
        response.setFirstName(savedUser.getFirstName());
        response.setLastName(savedUser.getLastName());
        response.setEmail(savedUser.getEmail());
        response.setPhoneNumber(savedUser.getPhoneNumber());
        response.setRole(savedUser.getRole().getRoleName().name());

        return response;
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponse(
                token,
                "Bearer",
                user.getEmail(),
                user.getRole().getRoleName().name()
        );
    }
}