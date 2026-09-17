package com.campusconnect.service;

import com.campusconnect.domain.Match;
import com.campusconnect.domain.Request;
import com.campusconnect.domain.RequestStatus;
import com.campusconnect.domain.User;
import com.campusconnect.repository.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class MatchService {

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private RequestService requestService;

    @Autowired
    private UserService userService;

    public Match acceptRequest(Long requestId, Long volunteerId) {
        Request request = requestService.getRequest(requestId);
        User volunteer = userService.getProfile(volunteerId);

        if (volunteer.getRole() != com.campusconnect.domain.Role.DAY_SCHOLAR) {
            throw new RuntimeException("Only day scholars can accept requests");
        }

        // Will throw exception if not OPEN
        requestService.updateStatus(requestId, RequestStatus.ACCEPTED, volunteerId);

        Match match = Match.builder()
                .request(request)
                .volunteer(volunteer)
                .acceptedAt(LocalDateTime.now())
                .build();

        return matchRepository.save(match);
    }
}
