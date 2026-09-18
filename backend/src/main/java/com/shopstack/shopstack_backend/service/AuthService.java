package com.shopstack.shopstack_backend.service;

import com.shopstack.shopstack_backend.dto.request.LoginRequest;
import com.shopstack.shopstack_backend.dto.request.RegisterRequest;
import com.shopstack.shopstack_backend.dto.response.LoginResponse;
import com.shopstack.shopstack_backend.dto.response.UserResponse;

public interface AuthService {

    UserResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);
}