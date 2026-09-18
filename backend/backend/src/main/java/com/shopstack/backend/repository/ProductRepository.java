package com.shopstack.backend.repository;


import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.User;



@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {



    List<Product> findByVendor(User vendor);

    java.util.Optional<Product> findByIdAndVendor(Long id, User vendor);

    java.util.Optional<Product> findByName(String name);



}
