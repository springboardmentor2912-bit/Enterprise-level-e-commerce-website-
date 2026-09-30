package com.shopstack.backend.service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.shopstack.backend.model.Product;

import jakarta.annotation.PostConstruct;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads/products}")
    private String uploadDir;

    @Value("${app.backend.base-url:http://localhost:8080}")
    private String baseUrl;

    private Path fileStorageLocation;

    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
            System.out.println("[FileStorageService] Upload directory initialized at: " + this.fileStorageLocation.toString());
        } catch (Exception ex) {
            throw new RuntimeException("Could not create directory for upload storage: " + this.fileStorageLocation, ex);
        }
    }

    public Path getFileStorageLocation() {
        return this.fileStorageLocation;
    }

    /**
     * Stores a MultipartFile into the upload folder and returns the access URL.
     */
    public String storeFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store empty file.");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            originalFilename = "image.png";
        }

        // Sanitize filename
        String cleanName = originalFilename.replaceAll("[^a-zA-Z0-9\\.\\-_]", "_");
        String uniqueFileName = System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + "_" + cleanName;

        Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
        }

        return baseUrl.replaceAll("/+$", "") + "/uploads/products/" + uniqueFileName;
    }

    /**
     * Checks if a string is a base64 encoded image and saves it to disk if so,
     * returning the static URL. If it's already a URL or emoji, returns as-is.
     */
    public String processAndSaveIfBase64(String input) {
        if (input == null || input.trim().isEmpty()) {
            return input;
        }

        String trimmed = input.trim();
        if (trimmed.startsWith("data:image/")) {
            try {
                int commaIndex = trimmed.indexOf(',');
                if (commaIndex != -1) {
                    String meta = trimmed.substring(0, commaIndex); // e.g. data:image/png;base64
                    String base64Data = trimmed.substring(commaIndex + 1);

                    String extension = ".png";
                    if (meta.contains("image/jpeg") || meta.contains("image/jpg")) {
                        extension = ".jpg";
                    } else if (meta.contains("image/webp")) {
                        extension = ".webp";
                    } else if (meta.contains("image/gif")) {
                        extension = ".gif";
                    } else if (meta.contains("image/svg+xml")) {
                        extension = ".svg";
                    }

                    byte[] decodedBytes = Base64.getDecoder().decode(base64Data);
                    String uniqueFileName = "img_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;
                    Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);

                    try (FileOutputStream fos = new FileOutputStream(targetLocation.toFile())) {
                        fos.write(decodedBytes);
                    }

                    return baseUrl.replaceAll("/+$", "") + "/uploads/products/" + uniqueFileName;
                }
            } catch (Exception e) {
                System.err.println("[FileStorageService] Error saving base64 image: " + e.getMessage());
            }
        }
        return input;
    }

    /**
     * Sanitizes all product image fields (cover image and image gallery) by converting
     * any raw base64 data into disk-saved files and replacing with static URLs.
     */
    public Product sanitizeProductImages(Product product) {
        if (product == null) return null;

        // Process cover image
        if (product.getImageUrl() != null) {
            product.setImageUrl(processAndSaveIfBase64(product.getImageUrl()));
        }

        // Process gallery images
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            List<String> sanitizedImages = new ArrayList<>();
            for (String img : product.getImages()) {
                sanitizedImages.add(processAndSaveIfBase64(img));
            }
            product.setImages(sanitizedImages);
        }

        return product;
    }

    /**
     * Deletes a stored product image file from the disk based on its URL or filename.
     * Safely ignores external URLs or emojis.
     */
    public boolean deleteFile(String imageUrlOrName) {
        if (imageUrlOrName == null || imageUrlOrName.trim().isEmpty()) {
            return false;
        }

        String target = imageUrlOrName.trim();
        String filename = target;

        // Extract filename if it contains the uploads path
        if (target.contains("/uploads/products/")) {
            int idx = target.indexOf("/uploads/products/");
            filename = target.substring(idx + "/uploads/products/".length());
        } else if (target.startsWith("http://") || target.startsWith("https://") || target.startsWith("data:")) {
            // External URL or raw data that is not stored on local disk
            return false;
        }

        // Clean query parameters or anchors if any
        int queryIdx = filename.indexOf('?');
        if (queryIdx != -1) {
            filename = filename.substring(0, queryIdx);
        }
        int hashIdx = filename.indexOf('#');
        if (hashIdx != -1) {
            filename = filename.substring(0, hashIdx);
        }

        try {
            Path filePath = this.fileStorageLocation.resolve(filename).normalize();
            // Path traversal security check
            if (!filePath.startsWith(this.fileStorageLocation)) {
                System.err.println("[FileStorageService] Security violation: Attempted access outside upload directory: " + filename);
                return false;
            }

            boolean deleted = Files.deleteIfExists(filePath);
            if (deleted) {
                System.out.println("[FileStorageService] Successfully deleted image file from disk: " + filePath.getFileName());
            } else {
                System.out.println("[FileStorageService] Image file did not exist or was already deleted: " + filePath.getFileName());
            }
            return deleted;
        } catch (Exception e) {
            System.err.println("[FileStorageService] Error deleting file " + filename + ": " + e.getMessage());
            return false;
        }
    }

    /**
     * Deletes multiple files from disk.
     */
    public void deleteFiles(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) return;
        for (String url : imageUrls) {
            deleteFile(url);
        }
    }
}

