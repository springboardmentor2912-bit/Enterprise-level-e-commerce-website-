package com.shopstack.security;

import com.shopstack.entity.Customer;
import com.shopstack.entity.Vendor;
import com.shopstack.repository.CustomerRepository;
import com.shopstack.repository.VendorRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final CustomerRepository customerRepository;
    private final VendorRepository vendorRepository;

    public CustomUserDetailsService(CustomerRepository customerRepository, VendorRepository vendorRepository) {
        this.customerRepository = customerRepository;
        this.vendorRepository = vendorRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + customer.getRole().name());
            return new User(customer.getEmail(), customer.getPassword(), Collections.singletonList(authority));
        }

        Optional<Vendor> vendorOpt = vendorRepository.findByEmail(email);
        if (vendorOpt.isPresent()) {
            Vendor vendor = vendorOpt.get();
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + vendor.getRole().name());
            return new User(vendor.getEmail(), vendor.getPassword(), Collections.singletonList(authority));
        }

        throw new UsernameNotFoundException("User or Vendor not found with email: " + email);
    }
}
