package com.shopstack.backend.controller;

import com.shopstack.backend.dto.*;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.enums.Role;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.repository.WarehouseRepository;
import com.shopstack.backend.service.WarehouseService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/warehouses")
public class AdminWarehouseController {
    private final WarehouseService warehouseService;
    private final UserRepository userRepository;
    private final WarehouseRepository warehouseRepository;
    private final PasswordEncoder passwordEncoder;
    public AdminWarehouseController(WarehouseService warehouseService, UserRepository userRepository, WarehouseRepository warehouseRepository, PasswordEncoder passwordEncoder){this.warehouseService=warehouseService;this.userRepository=userRepository;this.warehouseRepository=warehouseRepository;this.passwordEncoder=passwordEncoder;}

    @GetMapping public List<WarehouseResponse> all(){return warehouseService.getWarehouses();}
    @PostMapping public WarehouseResponse create(@RequestBody WarehouseRequest request){return warehouseService.createWarehouse(request);}
    @PutMapping("/{id}") public WarehouseResponse update(@PathVariable Long id,@RequestBody WarehouseRequest request){return warehouseService.updateWarehouse(id,request);}
    @DeleteMapping("/{id}") public ResponseEntity<?> delete(@PathVariable Long id){warehouseService.deleteWarehouse(id);return ResponseEntity.ok("Warehouse deleted");}

    @GetMapping("/inventory") public List<WarehouseInventoryResponse> inventory(){return warehouseService.getAllInventory();}
    @GetMapping("/{id}/inventory") public List<WarehouseInventoryResponse> inventory(@PathVariable Long id){return warehouseService.getInventory(id);}
    @PutMapping("/{id}/inventory") public WarehouseInventoryResponse updateInventory(@PathVariable Long id,@RequestBody WarehouseInventoryRequest request){return warehouseService.upsertInventory(id,request);}
    @GetMapping("/{id}/movements") public List<StockMovementResponse> movements(@PathVariable Long id){return warehouseService.getMovements(id);}
    @GetMapping("/analytics") public WarehouseAnalyticsResponse analytics(){return warehouseService.analytics();}
    @PostMapping("/allocate/{orderId}") public WarehouseAllocationResponse allocate(@PathVariable Long orderId){return warehouseService.allocateOrder(orderId);}

    @PostMapping("/staff")
    public WarehouseStaffResponse createStaff(@RequestBody WarehouseStaffCreateRequest request){
        if(request.getName()==null || request.getEmail()==null || request.getPassword()==null || request.getPassword().isBlank())
            throw new RuntimeException("Name, email and password are required");
        if(userRepository.findByEmail(request.getEmail()).isPresent()) throw new RuntimeException("Email already exists");
        User staff=new User();
        staff.setName(request.getName());
        staff.setEmail(request.getEmail());
        staff.setPassword(passwordEncoder.encode(request.getPassword()));
        staff.setRole(Role.WAREHOUSE_STAFF);
        staff=userRepository.save(staff);
        return new WarehouseStaffResponse(staff.getId(),staff.getName(),staff.getEmail(),null,null);
    }

    @GetMapping("/staff")
    public List<WarehouseStaffResponse> staff(){
        return userRepository.findByRole(Role.WAREHOUSE_STAFF).stream()
                .map(u -> new WarehouseStaffResponse(u.getId(), u.getName(), u.getEmail(),
                        u.getWarehouse()==null?null:u.getWarehouse().getId(),
                        u.getWarehouse()==null?null:u.getWarehouse().getName()))
                .toList();
    }

    @PutMapping("/staff/{staffId}/assign/{warehouseId}")
    public ResponseEntity<?> assign(@PathVariable Long staffId,@PathVariable Long warehouseId){
        User staff=userRepository.findById(staffId).orElseThrow(()->new RuntimeException("Staff user not found"));
        if(staff.getRole()!=Role.WAREHOUSE_STAFF) throw new RuntimeException("User is not warehouse staff");
        com.shopstack.backend.entity.Warehouse warehouse=warehouseRepository.findById(warehouseId)
                .orElseThrow(()->new RuntimeException("Warehouse not found"));
        staff.setWarehouse(warehouse);
        userRepository.save(staff);
        return ResponseEntity.ok("Warehouse assigned successfully");
    }

    @DeleteMapping("/staff/{staffId}/assignment")
    public ResponseEntity<?> unassign(@PathVariable Long staffId){
        User staff=userRepository.findById(staffId).orElseThrow(()->new RuntimeException("Staff user not found"));
        staff.setWarehouse(null); userRepository.save(staff); return ResponseEntity.ok("Warehouse assignment removed");
    }
}
