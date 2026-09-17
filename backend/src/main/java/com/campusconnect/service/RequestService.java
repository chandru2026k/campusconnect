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

    public Request createRequest(Request request) {
        request.setStatus(RequestStatus.OPEN);
        return requestRepository.save(request);
    }

    public Request getRequest(Long requestId) {
        return requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
    }

    public List<Request> getAllRequests() {
        return requestRepository.findAll();
    }

    public void updateStatus(Long requestId, RequestStatus newStatus, Long userId) {
        Request request = getRequest(requestId);
        
        validateTransition(request.getStatus(), newStatus);
        
        // Basic authorization checks could go here (e.g. only volunteer can mark DELIVERED)
        request.setStatus(newStatus);
        requestRepository.save(request);
    }

    public void validateTransition(RequestStatus current, RequestStatus target) {
        boolean isValid = switch (current) {
            case OPEN -> target == RequestStatus.ACCEPTED || target == RequestStatus.CANCELLED;
            case ACCEPTED -> target == RequestStatus.IN_PROGRESS || target == RequestStatus.DISPUTED;
            case IN_PROGRESS -> target == RequestStatus.DELIVERED || target == RequestStatus.DISPUTED;
            case DELIVERED -> target == RequestStatus.CONFIRMED || target == RequestStatus.DISPUTED;
            case CONFIRMED -> target == RequestStatus.RATED || target == RequestStatus.DISPUTED;
            case RATED, CANCELLED -> false; // Terminal states
            case DISPUTED -> target == RequestStatus.CANCELLED || target == RequestStatus.CONFIRMED; // Admin resolution
        };

        if (!isValid) {
            throw new IllegalStateException("Invalid status transition from " + current + " to " + target);
        }
    }
}
