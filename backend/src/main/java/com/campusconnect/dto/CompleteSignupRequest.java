package com.campusconnect.dto;

import com.campusconnect.domain.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CompleteSignupRequest {
    @NotNull(message = "Role is required")
    private Role role;

    private String hostelId; // Required if role is HOSTEL_STUDENT
}
