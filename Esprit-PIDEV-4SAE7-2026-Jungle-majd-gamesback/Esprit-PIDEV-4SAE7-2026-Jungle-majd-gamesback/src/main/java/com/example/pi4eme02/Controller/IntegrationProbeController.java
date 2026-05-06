package com.example.pi4eme02.Controller;

import com.example.pi4eme02.Client.UserServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/integration")
@RequiredArgsConstructor
public class IntegrationProbeController {

    private final UserServiceClient userServiceClient;

    @GetMapping("/users-health")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> usersHealthViaFeign() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("caller", "pi4eme02");
        response.put("targetService", "user-service");
        try {
            response.put("success", true);
            response.put("payload", userServiceClient.health());
        } catch (Exception ex) {
            response.put("success", false);
            response.put("error", ex.getClass().getSimpleName());
            response.put("message", ex.getMessage());
        }
        return response;
    }
}
