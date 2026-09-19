package com.shopstack.shopstack_backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }


    public String uploadImage(MultipartFile file) throws IOException {

        Map uploadResult = cloudinary.uploader()
                .upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "folder", "shopstack/products"
                        )
                );

        return uploadResult.get("secure_url").toString();
    }
}