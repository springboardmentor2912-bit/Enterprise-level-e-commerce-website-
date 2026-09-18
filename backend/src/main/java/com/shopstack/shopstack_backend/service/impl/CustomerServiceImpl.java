package com.shopstack.shopstack_backend.service.impl;

import com.shopstack.shopstack_backend.dto.request.CustomerRequest;
import com.shopstack.shopstack_backend.dto.response.CustomerResponse;
import com.shopstack.shopstack_backend.entity.Customer;
import com.shopstack.shopstack_backend.entity.User;
import com.shopstack.shopstack_backend.repository.CustomerRepository;
import com.shopstack.shopstack_backend.repository.UserRepository;
import com.shopstack.shopstack_backend.service.CustomerService;
import org.springframework.stereotype.Service;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository,
                               UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    @Override
    public CustomerResponse createCustomer(Long userId, CustomerRequest request) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Customer customer = new Customer();
        customer.setUser(user);
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setState(request.getState());
        customer.setCountry(request.getCountry());
        customer.setPincode(request.getPincode());

        Customer savedCustomer = customerRepository.save(customer);

        CustomerResponse response = new CustomerResponse();
        response.setId(savedCustomer.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setAddress(savedCustomer.getAddress());
        response.setCity(savedCustomer.getCity());
        response.setState(savedCustomer.getState());
        response.setCountry(savedCustomer.getCountry());
        response.setPincode(savedCustomer.getPincode());

        return response;
    }

    @Override
    public CustomerResponse getCustomerByUserId(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Customer customer = customerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        CustomerResponse response = new CustomerResponse();
        response.setId(customer.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setAddress(customer.getAddress());
        response.setCity(customer.getCity());
        response.setState(customer.getState());
        response.setCountry(customer.getCountry());
        response.setPincode(customer.getPincode());

        return response;
    }
}