package com.shopstack.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.shopstack.backend.entity.Warehouse;
import com.shopstack.backend.repository.WarehouseRepository;

@Configuration
public class WarehouseSeeder {
    @Bean
    CommandLineRunner seedWarehouses(WarehouseRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                repository.save(new Warehouse("Bengaluru Central", "BLR-01", "Peenya Industrial Area, Bengaluru", "Warehouse team", 1200));
                repository.save(new Warehouse("Mumbai West", "MUM-01", "Andheri East, Mumbai", "Warehouse team", 1500));
                repository.save(new Warehouse("Delhi North", "DEL-01", "Bawana Industrial Area, Delhi", "Warehouse team", 1000));
            }
        };
    }
}
