package com.shopstack.backend.repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shopstack.backend.entity.User;
import com.shopstack.backend.entity.VendorProfile;



public interface VendorProfileRepository 
        extends JpaRepository<VendorProfile, Long> {


    Optional<VendorProfile> findByUser(User user);


}