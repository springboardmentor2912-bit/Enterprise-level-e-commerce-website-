package com.shopstack.backend.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads/products}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .exposedHeaders("Content-Disposition")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String uploadUri = uploadPath.toUri().toString();
        if (!uploadUri.endsWith("/")) {
            uploadUri += "/";
        }
        
        CacheControl imageCacheControl = CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic();

        // Serve specific products directory at /uploads/products/** with HTTP browser caching
        registry.addResourceHandler("/uploads/products/**")
                .addResourceLocations(uploadUri)
                .setCacheControl(imageCacheControl)
                .resourceChain(true);

        // General /uploads/** fallback handler with HTTP browser caching
        Path rootUploadPath = Paths.get("uploads").toAbsolutePath().normalize();
        String rootUploadUri = rootUploadPath.toUri().toString();
        if (!rootUploadUri.endsWith("/")) {
            rootUploadUri += "/";
        }
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(rootUploadUri)
                .setCacheControl(imageCacheControl)
                .resourceChain(true);
    }
}

