package com.campusconnect.dto;

import com.campusconnect.domain.Category;
import com.campusconnect.domain.LocationHint;
import com.campusconnect.domain.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestDetailDto {
    private Long id;
    private String title;
    private String description;
    private Category category;
    private RequestStatus status;
    private LocationHint locationHint;
    private Boolean isEmergency;
    private LocalDateTime createdAt;
    private LocalDateTime deadlineAt;
    
    private UserSummaryDto requester;
    private UserSummaryDto volunteer;
    private LocalDateTime acceptedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummaryDto {
        private Long id;
        private String name;
        private String role;
        private String hostelId;
        private Double reputationScore;
    }
}
