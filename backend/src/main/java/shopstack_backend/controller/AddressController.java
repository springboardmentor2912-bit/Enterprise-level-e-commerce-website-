package shopstack_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import shopstack_backend.dto.AddressRequestDTO;
import shopstack_backend.dto.AddressResponseDTO;
import shopstack_backend.service.AddressService;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@CrossOrigin(origins = "http://localhost:5173")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressResponseDTO>> getAddresses(Authentication authentication) {
        return ResponseEntity.ok(addressService.getAddresses(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<?> addAddress(Authentication authentication, @RequestBody AddressRequestDTO dto) {
        try {
            return ResponseEntity.ok(addressService.addAddress(authentication.getName(), dto));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAddress(@PathVariable Long id, Authentication authentication,
                                            @RequestBody AddressRequestDTO dto) {
        try {
            return ResponseEntity.ok(addressService.updateAddress(authentication.getName(), id, dto));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAddress(@PathVariable Long id, Authentication authentication) {
        try {
            addressService.deleteAddress(authentication.getName(), id);
            return ResponseEntity.ok().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<?> setDefault(@PathVariable Long id, Authentication authentication) {
        try {
            return ResponseEntity.ok(addressService.setDefault(authentication.getName(), id));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}