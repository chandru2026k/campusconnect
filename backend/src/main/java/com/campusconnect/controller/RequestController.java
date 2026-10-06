package com.campusconnect.controller;

import com.campusconnect.domain.Request;
import com.campusconnect.domain.RequestStatus;
import com.campusconnect.security.UserDetailsImpl;
import com.campusconnect.service.MatchService;
import com.campusconnect.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/requests")
public class RequestController {

    @Autowired
    private RequestService requestService;

    @Autowired
    private MatchService matchService;

    @Autowired
    private com.campusconnect.service.MessageService messageService;

    @PostMapping
    public ResponseEntity<Request> createRequest(@RequestBody Request request, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        request.setRequester(userDetails.getUser());
        return ResponseEntity.ok(requestService.createRequest(request));
    }

    @GetMapping
    public ResponseEntity<List<Request>> listRequests() {
        return ResponseEntity.ok(requestService.getAllRequests());
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            return ResponseEntity.ok(matchService.acceptRequest(id, userDetails.getUser().getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            RequestStatus status = RequestStatus.valueOf(body.get("status"));
            String pin = body.get("pin");
            requestService.updateStatus(id, status, userDetails.getUser().getId(), pin);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRequest(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            requestService.deleteRequest(id, userDetails.getUser().getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<?> getChatHistory(@PathVariable Long id) {
        // Expose chat history via REST
        return ResponseEntity.ok(messageService.getChatHistory(id));
    }
    @GetMapping("/{id}/pin")
    public ResponseEntity<?> getDeliveryPin(@PathVariable Long id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Request req = requestService.getRequest(id);
        if (req.getRequester().getId().equals(userDetails.getUser().getId())) {
            return ResponseEntity.ok(Map.of("pin", req.getDeliveryPin()));
        }
        return ResponseEntity.status(403).body("Only requester can view the PIN");
    }
}
