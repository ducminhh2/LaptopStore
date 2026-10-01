package com.laptopstore.service;

import com.laptopstore.dto.AuthResponse;
import com.laptopstore.dto.LoginRequest;
import com.laptopstore.dto.RegisterRequest;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse register(RegisterRequest request);
}
