package com.infosys.springboard.authentication.entity;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {


@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

private Long orderId;

private Long productId;

private String productName;

private String vendorEmail;

private Integer quantity;

private BigDecimal price;

private BigDecimal subtotal;


}
