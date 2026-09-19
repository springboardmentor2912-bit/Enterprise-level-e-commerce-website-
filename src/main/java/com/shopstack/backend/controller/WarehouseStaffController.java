package com.shopstack.backend.controller;

import com.shopstack.backend.dto.WarehouseAllocationResponse;
import com.shopstack.backend.service.JwtService;
import com.shopstack.backend.service.WarehouseService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/warehouse-staff")
public class WarehouseStaffController {
    private final WarehouseService warehouseService;
    private final JwtService jwtService;
    public WarehouseStaffController(WarehouseService warehouseService, JwtService jwtService){this.warehouseService=warehouseService;this.jwtService=jwtService;}
    private String email(String header){return jwtService.extractEmail(header.substring(7));}

    @GetMapping("/orders") public List<WarehouseAllocationResponse> orders(@RequestHeader("Authorization") String auth){return warehouseService.getStaffOrders(email(auth));}
    @PutMapping("/orders/{id}/claim") public WarehouseAllocationResponse claim(@PathVariable Long id,@RequestHeader("Authorization") String auth){return warehouseService.claim(id,email(auth));}
    @PutMapping("/orders/{id}/pick") public WarehouseAllocationResponse pick(@PathVariable Long id,@RequestHeader("Authorization") String auth){return warehouseService.pick(id,email(auth));}
    @PutMapping("/orders/{id}/pack") public WarehouseAllocationResponse pack(@PathVariable Long id,@RequestHeader("Authorization") String auth){return warehouseService.pack(id,email(auth));}
    @PutMapping("/orders/{id}/ready-for-shipping") public WarehouseAllocationResponse ready(@PathVariable Long id,@RequestHeader("Authorization") String auth){return warehouseService.readyForShipping(id,email(auth));}
}
