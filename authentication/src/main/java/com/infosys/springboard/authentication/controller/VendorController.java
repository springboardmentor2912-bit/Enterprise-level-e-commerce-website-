package com.infosys.springboard.authentication.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/vendor")
public class VendorController {

    @GetMapping("/test")
    public String vendorTest() {
        return "Vendor access successful!";
    }
}