package com.shopstack.shopstack_backend.controller;

import com.shopstack.shopstack_backend.service.CloudinaryService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/images")
@CrossOrigin(origins = "http://localhost:3000")
public class ImageUploadController {

    private final CloudinaryService cloudinaryService;

    public ImageUploadController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }


    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(
            @RequestParam("file") MultipartFile file) {

        try {

            String imageUrl = cloudinaryService.uploadImage(file);

            return ResponseEntity.ok(imageUrl);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body("Image upload failed");
        }
    }
}