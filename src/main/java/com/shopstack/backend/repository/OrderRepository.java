package com.shopstack.backend.repository;

import com.shopstack.backend.entity.Order;
import com.shopstack.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserOrderByOrderDateDesc(User user);
    List<Order> findAllByOrderByOrderDateDesc();

}