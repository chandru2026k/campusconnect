package com.campusconnect.controller;

import com.campusconnect.domain.User;
import com.campusconnect.security.UserDetailsImpl;
import com.campusconnect.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails.getUser().getId()));
    }

    @PatchMapping("/me")
    public ResponseEntity<?> updateMyProfile(@AuthenticationPrincipal UserDetailsImpl userDetails, @RequestBody Map<String, String> body) {
        return doUpdate(userDetails, body);
    }

    @PostMapping("/me/update")
    public ResponseEntity<?> updateMyProfilePost(@AuthenticationPrincipal UserDetailsImpl userDetails, @RequestBody Map<String, String> body) {
        return doUpdate(userDetails, body);
    }

    private ResponseEntity<?> doUpdate(UserDetailsImpl userDetails, Map<String, String> body) {
        try {
            User updated = userService.updateProfile(userDetails.getUser().getId(), body.get("name"), body.get("hostelId"));
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/me/connections")
    public ResponseEntity<?> getMyConnections(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getConnections(userDetails.getUser().getId()));
    }
}
