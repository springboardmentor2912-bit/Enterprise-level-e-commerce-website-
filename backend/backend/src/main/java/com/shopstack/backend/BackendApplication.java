package com.shopstack.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        System.out.println("JAVA TIMEZONE = " + java.time.ZoneId.systemDefault());
        System.out.println("JAVA LOCAL TIME = " + java.time.LocalDateTime.now());

        SpringApplication.run(BackendApplication.class, args);
    }
}