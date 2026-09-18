package com.shopstack.backend.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstack.backend.model.User;
import com.shopstack.backend.repository.UserRepository;

@Service
public class CloudSyncService {

    private static final String CLOUD_BACKEND_URL = "http://13.48.47.35:8080";

    @Autowired
    private UserRepository userRepository;

    @Value("${app.backend.base-url:http://localhost:8080}")
    private String currentBaseUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(4))
            .build();

    /**
     * Whenever a user registers or logs in locally, immediately replicate to the AWS Cloud Database
     */
    @Async
    public void pushUserToCloud(User user) {
        if (currentBaseUrl.contains("13.48.47.35") || user == null || user.getEmail() == null) {
            return;
        }

        try {
            JSONObject json = new JSONObject();
            json.put("fullName", user.getFullName());
            json.put("email", user.getEmail());
            json.put("password", user.getPassword());
            json.put("role", user.getRole());
            if (user.getPhone() != null) json.put("phone", user.getPhone());
            if (user.getAddress() != null) json.put("address", user.getAddress());
            if (user.getVendorCode() != null) json.put("vendorCode", user.getVendorCode());
            if (user.getCommissionRate() != null) json.put("commissionRate", user.getCommissionRate());
            if (user.getWarehouseId() != null) json.put("warehouseId", user.getWarehouseId());
            if (user.getWarehouseName() != null) json.put("warehouseName", user.getWarehouseName());

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(CLOUD_BACKEND_URL + "/api/auth/register"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(5))
                    .POST(HttpRequest.BodyPublishers.ofString(json.toString()))
                    .build();

            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(res -> {
                        if (res.statusCode() == 200 || res.statusCode() == 201) {
                            System.out.println(">>> [AUTO-SYNC] User replicated to AWS Cloud Database: " + user.getEmail());
                        } else {
                            pushUserLoginToCloud(user);
                        }
                    })
                    .exceptionally(ex -> null);
        } catch (Exception ignored) {}
    }

    private void pushUserLoginToCloud(User user) {
        try {
            JSONObject json = new JSONObject();
            json.put("email", user.getEmail());
            json.put("password", user.getPassword());
            json.put("role", user.getRole());
            if (user.getVendorCode() != null) {
                json.put("vendorCode", user.getVendorCode());
            }

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(CLOUD_BACKEND_URL + "/api/auth/login"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(5))
                    .POST(HttpRequest.BodyPublishers.ofString(json.toString()))
                    .build();

            httpClient.sendAsync(req, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(res -> {
                        if (res.statusCode() == 200) {
                            System.out.println(">>> [AUTO-SYNC] User updated on AWS Cloud Database: " + user.getEmail());
                        }
                    })
                    .exceptionally(ex -> null);
        } catch (Exception ignored) {}
    }

    /**
     * Automatically poll the AWS Cloud instance every 5 seconds to pull any newly registered cloud users
     * into the local PostgreSQL database (shopstack_db) without requiring any manual commands.
     */
    @Scheduled(fixedDelay = 5000, initialDelay = 3000)
    @Transactional
    public void syncCloudUsersToLocalDatabase() {
        if (currentBaseUrl.contains("13.48.47.35")) {
            return;
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(CLOUD_BACKEND_URL + "/api/auth/users"))
                    .timeout(Duration.ofSeconds(4))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200 && response.body() != null && !response.body().isBlank()) {
                JSONArray cloudUsers = new JSONArray(response.body());

                for (int i = 0; i < cloudUsers.length(); i++) {
                    JSONObject obj = cloudUsers.getJSONObject(i);
                    String email = obj.optString("email", "").trim().toLowerCase();
                    if (email.isBlank()) continue;

                    java.util.Optional<User> localUserOpt = userRepository.findByEmailIgnoreCase(email);

                    if (localUserOpt.isEmpty()) {
                        User newLocalUser = new User();
                        newLocalUser.setEmail(email);
                        newLocalUser.setFullName(obj.optString("fullName", "User"));
                        newLocalUser.setPassword(obj.optString("password", "Pass@123"));
                        newLocalUser.setRole(obj.optString("role", "CUSTOMER"));
                        if (obj.has("phone") && !obj.isNull("phone")) newLocalUser.setPhone(obj.getString("phone"));
                        if (obj.has("address") && !obj.isNull("address")) newLocalUser.setAddress(obj.getString("address"));
                        if (obj.has("vendorCode") && !obj.isNull("vendorCode")) newLocalUser.setVendorCode(obj.getString("vendorCode"));
                        if (obj.has("commissionRate") && !obj.isNull("commissionRate")) newLocalUser.setCommissionRate(obj.getDouble("commissionRate"));
                        if (obj.has("warehouseId") && !obj.isNull("warehouseId")) newLocalUser.setWarehouseId(obj.getLong("warehouseId"));
                        if (obj.has("warehouseName") && !obj.isNull("warehouseName")) newLocalUser.setWarehouseName(obj.getString("warehouseName"));

                        userRepository.saveAndFlush(newLocalUser);
                        System.out.println(">>> [AUTO-SYNC] Cloud registration automatically saved to Local PostgreSQL: " + email + " [Role: " + newLocalUser.getRole() + "]");
                    } else {
                        User localUser = localUserOpt.get();
                        boolean updated = false;

                        if (obj.has("password") && !obj.isNull("password") && !obj.getString("password").equals(localUser.getPassword())) {
                            localUser.setPassword(obj.getString("password"));
                            updated = true;
                        }
                        if (obj.has("role") && !obj.isNull("role") && !obj.getString("role").equals(localUser.getRole())) {
                            localUser.setRole(obj.getString("role"));
                            updated = true;
                        }
                        if (obj.has("vendorCode") && !obj.isNull("vendorCode") && !obj.getString("vendorCode").equals(localUser.getVendorCode())) {
                            localUser.setVendorCode(obj.getString("vendorCode"));
                            updated = true;
                        }
                        if (obj.has("fullName") && !obj.isNull("fullName") && !obj.getString("fullName").equals(localUser.getFullName())) {
                            localUser.setFullName(obj.getString("fullName"));
                            updated = true;
                        }

                        if (updated) {
                            userRepository.saveAndFlush(localUser);
                        }
                    }
                }
            }
        } catch (Exception ignored) {}
    }
}
