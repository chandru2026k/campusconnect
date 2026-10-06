package com.campusconnect.service;

import com.campusconnect.domain.Request;
import com.campusconnect.domain.RequestStatus;
import com.campusconnect.repository.RequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RequestService {

    @Autowired
    private RequestRepository requestRepository;

    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 60000)
    public void expireOldRequests() {
        List<Request> expired = requestRepository.findByStatusAndDeadlineAtBefore(RequestStatus.OPEN, java.time.LocalDateTime.now());
        for (Request req : expired) {
            req.setStatus(RequestStatus.EXPIRED);
            requestRepository.save(req);
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
        return requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
    }

    public List<Request> getAllRequests() {
        return requestRepository.findAll();
    }

    public void updateStatus(Long requestId, RequestStatus newStatus, Long userId, String pin) {
        Request request = getRequest(requestId);
        
        validateTransition(request.getStatus(), newStatus);
        
        // Basic authorization checks could go here (e.g. only volunteer can mark DELIVERED)
        if (newStatus == RequestStatus.DELIVERED) {
            if (pin == null || !pin.equals(request.getDeliveryPin())) {
                throw new IllegalArgumentException("Invalid delivery PIN");
            }
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
