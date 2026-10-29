package com.campusconnect.service;

import com.campusconnect.domain.Request;
import com.campusconnect.domain.RequestStatus;
import com.campusconnect.domain.User;
import com.campusconnect.dto.RequestDetailDto;
import com.campusconnect.repository.MatchRepository;
import com.campusconnect.repository.RequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RequestService {

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private MatchRepository matchRepository;

    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 60000)
    public void expireOldRequests() {
        List<Request> expired = requestRepository.findByStatusAndDeadlineAtBefore(RequestStatus.OPEN, java.time.LocalDateTime.now());
        if (!expired.isEmpty()) {
            for (Request req : expired) {
                req.setStatus(RequestStatus.EXPIRED);
            }
            requestRepository.saveAll(expired);
        }
    }

    public Request createRequest(Request request) {
        request.setStatus(RequestStatus.OPEN);
        if (request.getDeadlineAt() == null) {
            request.setDeadlineAt(java.time.LocalDateTime.now().plusHours(2));
        }
        if (request.getDeliveryPin() == null) {
            request.setDeliveryPin(String.format("%04d", new java.util.Random().nextInt(10000)));
        }
        return requestRepository.save(request);
    }

    public Request getRequest(Long requestId) {
        return requestRepository.findWithRequesterById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
    }

    public RequestDetailDto getRequestDetail(Long requestId) {
        Request request = getRequest(requestId);
        
        RequestDetailDto.UserSummaryDto requesterSummary = null;
        if (request.getRequester() != null) {
            User r = request.getRequester();
            requesterSummary = RequestDetailDto.UserSummaryDto.builder()
                    .id(r.getId())
                    .name(r.getName())
                    .role(r.getRole() != null ? r.getRole().name() : null)
                    .hostelId(r.getHostelId())
                    .reputationScore(r.getReputationScore())
                    .build();
        }

        RequestDetailDto.UserSummaryDto volunteerSummary = null;
        java.time.LocalDateTime acceptedAt = null;
        var matchOpt = matchRepository.findByRequestId(requestId);
        if (matchOpt.isPresent()) {
            var match = matchOpt.get();
            acceptedAt = match.getAcceptedAt();
            if (match.getVolunteer() != null) {
                User v = match.getVolunteer();
                volunteerSummary = RequestDetailDto.UserSummaryDto.builder()
                        .id(v.getId())
                        .name(v.getName())
                        .role(v.getRole() != null ? v.getRole().name() : null)
                        .hostelId(v.getHostelId())
                        .reputationScore(v.getReputationScore())
                        .build();
            }
        }

        return RequestDetailDto.builder()
                .id(request.getId())
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .status(request.getStatus())
                .locationHint(request.getLocationHint())
                .isEmergency(request.getIsEmergency())
                .createdAt(request.getCreatedAt())
                .deadlineAt(request.getDeadlineAt())
                .requester(requesterSummary)
                .volunteer(volunteerSummary)
                .acceptedAt(acceptedAt)
                .build();
    }

    public List<Request> getAllRequests() {
        return requestRepository.findAllByOrderByCreatedAtDesc();
    }

    public void updateStatus(Long requestId, RequestStatus newStatus, Long userId, String pin) {
        Request request = getRequest(requestId);
        
        validateTransition(request.getStatus(), newStatus);
        
        if (newStatus == RequestStatus.DELIVERED) {
            if (pin == null || !pin.equals(request.getDeliveryPin())) {
                throw new IllegalArgumentException("Invalid delivery PIN");
            }
            // Once delivery PIN is verified, advance directly to CONFIRMED
            newStatus = RequestStatus.CONFIRMED;
        }
        request.setStatus(newStatus);
        requestRepository.save(request);
    }

    public void deleteRequest(Long requestId, Long userId) {
        Request request = getRequest(requestId);
        if (!request.getRequester().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own requests");
        }
        if (request.getStatus() != RequestStatus.OPEN) {
            throw new RuntimeException("Cannot delete request because it is already accepted or in progress");
        }
        requestRepository.delete(request);
    }

    public void validateTransition(RequestStatus current, RequestStatus target) {
        boolean isValid = switch (current) {
            case OPEN -> target == RequestStatus.ACCEPTED || target == RequestStatus.CANCELLED || target == RequestStatus.EXPIRED;
            case ACCEPTED -> target == RequestStatus.IN_PROGRESS || target == RequestStatus.DISPUTED;
            case IN_PROGRESS -> target == RequestStatus.DELIVERED || target == RequestStatus.DISPUTED;
            case DELIVERED -> target == RequestStatus.CONFIRMED || target == RequestStatus.DISPUTED;
            case CONFIRMED -> target == RequestStatus.RATED || target == RequestStatus.DISPUTED;
            case RATED, CANCELLED, EXPIRED -> false; // Terminal states
            case DISPUTED -> target == RequestStatus.CANCELLED || target == RequestStatus.CONFIRMED; // Admin resolution
        };

        if (!isValid) {
            throw new IllegalStateException("Invalid status transition from " + current + " to " + target);
        }
    }
}
