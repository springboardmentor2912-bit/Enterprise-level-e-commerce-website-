package com.shopstack.shopstack_backend.service;

import java.util.Optional;

import org.springframework.stereotype.Service;
import com.shopstack.shopstack_backend.repository.UserRepository;
import com.shopstack.shopstack_backend.entity.User;

//import com.shopstack.shopstack_backend.entity.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;



@Service
public class UserService {

    //UserService has a dependency on UserRepository.
    private final UserRepository userRepository;
    //private final UserRepository userRepository;
    private final BCryptPasswordEncoder encoder;

    
    //When creating UserService, Spring, please provide UserRepository.
    public UserService(UserRepository userRepository, BCryptPasswordEncoder encoder){
        this.userRepository = userRepository;
        this.encoder = encoder;
    }

    public User registerUser(User user)
    {
        if(userRepository.findByEmail(user.getEmail()).isPresent()){
            throw new RuntimeException("Email already exists");
        }
        // if(userRepository.findByRole(user.getRole()).isPresent()){
        //     throw new RuntimeException("Email already exists");
        // }
        user.setPassword(encoder.encode(user.getPassword()));
        return userRepository.save(user);
    }


    public User login(String email,String password){

        Optional<User> user=userRepository.findByEmail(email);

        if(user.isEmpty()){
            throw new RuntimeException("User not found");
        }

        if(!encoder.matches(password,user.get().getPassword())){
            throw new RuntimeException("Invalid Password");
        }

        return user.get();

    }

    public User updateProfile(Long id, User updatedUser) {

    Optional<User> existingUser = userRepository.findById(id);

    if (existingUser.isEmpty()) {
        throw new RuntimeException("User not found");
    }

    User user = existingUser.get();

    user.setName(updatedUser.getName());
    user.setEmail(updatedUser.getEmail());
    user.setPhoneNumber(updatedUser.getPhoneNumber());
    user.setAddress(updatedUser.getAddress());
    user.setCity(updatedUser.getCity());
    user.setState(updatedUser.getState());
    user.setPincode(updatedUser.getPincode());
    user.setCountry(updatedUser.getCountry());

    return userRepository.save(user);
}

    public User getProfile(Long id) {

    Optional<User> user = userRepository.findById(id);

    if(user.isEmpty()) {
        throw new RuntimeException("User not found");
    }

    return user.get();
    }

    



}