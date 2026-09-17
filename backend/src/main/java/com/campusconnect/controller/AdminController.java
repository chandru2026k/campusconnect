package com.campusconnect.controller;

import com.campusconnect.domain.User;
import com.campusconnect.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
// Requires admin role (assuming role prefix is ROLE_ADMIN as configured in UserDetailsImpl)
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/pending-students")
    public ResponseEntity<List<User>> getPendingStudents() {
        return ResponseEntity.ok(userService.getPendingHostelStudents());
    }

    @PostMapping("/users/{id}/approve")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        try {
            userService.approveUser(id);
            return ResponseEntity.ok("User approved");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/users/{id}/suspend")
    public ResponseEntity<?> suspendUser(@PathVariable Long id) {
        userService.suspendUser(id);
        return ResponseEntity.ok("User suspended");
    }
}
