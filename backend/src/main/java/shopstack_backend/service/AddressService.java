package shopstack_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import shopstack_backend.dto.AddressRequestDTO;
import shopstack_backend.dto.AddressResponseDTO;
import shopstack_backend.entity.Address;
import shopstack_backend.entity.User;
import shopstack_backend.repository.AddressRepository;
import shopstack_backend.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AddressResponseDTO> getAddresses(String email) {
        return addressRepository.findByUserEmail(email)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponseDTO addAddress(String email, AddressRequestDTO dto) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Address address = new Address();
        address.setUser(user);
        applyDTO(address, dto);

        // First address a user ever saves becomes their default automatically.
        boolean isFirstAddress = addressRepository.findByUserEmail(email).isEmpty();
        if (isFirstAddress) {
            address.setDefault(true);
        } else if (Boolean.TRUE.equals(dto.getIsDefault())) {
            clearExistingDefault(email);
            address.setDefault(true);
        }

        return mapToDTO(addressRepository.save(address));
    }

    @Transactional
    public AddressResponseDTO updateAddress(String email, Long addressId, AddressRequestDTO dto) {
        Address address = addressRepository.findByIdAndUserEmail(addressId, email)
                .orElseThrow(() -> new SecurityException("Address not found for this account."));

        applyDTO(address, dto);

        if (Boolean.TRUE.equals(dto.getIsDefault()) && !address.isDefault()) {
            clearExistingDefault(email);
            address.setDefault(true);
        }

        return mapToDTO(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(String email, Long addressId) {
        Address address = addressRepository.findByIdAndUserEmail(addressId, email)
                .orElseThrow(() -> new SecurityException("Address not found for this account."));

        boolean wasDefault = address.isDefault();
        addressRepository.delete(address);

        // If the default address was just deleted, promote the next
        // remaining one so there's always a sensible default when one exists.
        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserEmail(email);
            if (!remaining.isEmpty()) {
                Address next = remaining.get(0);
                next.setDefault(true);
                addressRepository.save(next);
            }
        }
    }

    @Transactional
    public AddressResponseDTO setDefault(String email, Long addressId) {
        Address address = addressRepository.findByIdAndUserEmail(addressId, email)
                .orElseThrow(() -> new SecurityException("Address not found for this account."));

        clearExistingDefault(email);
        address.setDefault(true);

        return mapToDTO(addressRepository.save(address));
    }

    private void clearExistingDefault(String email) {
        addressRepository.findByUserEmail(email).forEach(a -> {
            if (a.isDefault()) {
                a.setDefault(false);
                addressRepository.save(a);
            }
        });
    }

    private void applyDTO(Address address, AddressRequestDTO dto) {
        address.setFullName(dto.getFullName());
        address.setPhone(dto.getPhone());
        address.setAddressLine1(dto.getAddressLine1());
        address.setAddressLine2(dto.getAddressLine2());
        address.setCity(dto.getCity());
        address.setState(dto.getState());
        address.setPostalCode(dto.getPostalCode());
        address.setCountry(dto.getCountry());
    }

    private AddressResponseDTO mapToDTO(Address address) {
        AddressResponseDTO dto = new AddressResponseDTO();
        dto.setId(address.getId());
        dto.setFullName(address.getFullName());
        dto.setPhone(address.getPhone());
        dto.setAddressLine1(address.getAddressLine1());
        dto.setAddressLine2(address.getAddressLine2());
        dto.setCity(address.getCity());
        dto.setState(address.getState());
        dto.setPostalCode(address.getPostalCode());
        dto.setCountry(address.getCountry());
        dto.setDefault(address.isDefault());
        return dto;
    }
}