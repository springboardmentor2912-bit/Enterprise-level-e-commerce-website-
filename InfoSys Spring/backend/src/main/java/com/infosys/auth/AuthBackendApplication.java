package com.infosys.auth;

import com.infosys.auth.config.DotenvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AuthBackendApplication {

    public static void main(String[] args) {
        // Load environment variables from .env if present
        DotenvLoader.load();

        SpringApplication.run(AuthBackendApplication.class, args);
        System.out.println("Server Listening!");
    }
}
