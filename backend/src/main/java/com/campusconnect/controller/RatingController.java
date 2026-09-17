package com.campusconnect.controller;

import com.campusconnect.domain.Rating;
import com.campusconnect.security.UserDetailsImpl;
import com.campusconnect.service.RatingService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ratings")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @PostMapping
    public ResponseEntity<?> rateRequest(@RequestBody RatingDto dto, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Rating rating = ratingService.rateRequest(dto.getRequestId(), userDetails.getUser().getId(), dto.getRateeId(), dto.getStars(), dto.getComment());
            return ResponseEntity.ok(rating);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Data
    public static class RatingDto {
        private Long requestId;
        private Long rateeId;
        private Integer stars;
        private String comment;
    }
}
