package com.campusconnect.controller;

import com.campusconnect.dto.AuthResponse;
import com.campusconnect.dto.CompleteSignupRequest;
import com.campusconnect.dto.GoogleAuthRequest;
import com.campusconnect.security.UserDetailsImpl;
import com.campusconnect.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@Valid @RequestBody GoogleAuthRequest request) {
        try {
            AuthResponse response = authService.verifyGoogleToken(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/complete-signup")
    public ResponseEntity<?> completeSignup(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CompleteSignupRequest request) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }
            AuthResponse response = authService.completeSignup(userDetails.getUser().getId(), request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
