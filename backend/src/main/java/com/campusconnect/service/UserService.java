package com.campusconnect.service;

import com.campusconnect.domain.AccountStatus;
import com.campusconnect.domain.Role;
import com.campusconnect.domain.User;
import com.campusconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User getProfile(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<User> getPendingHostelStudents() {
        // Simple fetch all and filter for prototype
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.HOSTEL_STUDENT && u.getAccountStatus() == AccountStatus.PENDING)
                .toList();
    }

    public void approveUser(Long userId) {
        User user = getProfile(userId);
        if (user.getRole() == Role.HOSTEL_STUDENT && user.getAccountStatus() == AccountStatus.PENDING) {
            user.setAccountStatus(AccountStatus.ACTIVE);
            userRepository.save(user);
        } else {
            throw new RuntimeException("User is not a pending hostel student");
        }
    }

    public User updateProfile(Long userId, String name, String hostelId) {
        User user = getProfile(userId);
        if (name != null && !name.isBlank()) user.setName(name);
        if (hostelId != null && !hostelId.isBlank()) user.setHostelId(hostelId);
        return userRepository.save(user);
    }

    @Autowired
    private com.campusconnect.repository.MatchRepository matchRepository;

    public java.util.Set<User> getConnections(Long userId) {
        java.util.List<com.campusconnect.domain.Match> matches = matchRepository.findByRequestRequesterIdOrVolunteerId(userId, userId);
        java.util.Set<User> connections = new java.util.HashSet<>();
        for (com.campusconnect.domain.Match m : matches) {
            if (m.getRequest().getStatus() == com.campusconnect.domain.RequestStatus.CONFIRMED || m.getRequest().getStatus() == com.campusconnect.domain.RequestStatus.RATED) {
                if (!m.getVolunteer().getId().equals(userId)) connections.add(m.getVolunteer());
                if (!m.getRequest().getRequester().getId().equals(userId)) connections.add(m.getRequest().getRequester());
            }
        }
        return connections;
    }

    public void suspendUser(Long userId) {
        User user = getProfile(userId);
        user.setAccountStatus(AccountStatus.SUSPENDED);
        userRepository.save(user);
    }

    public List<User> getTopScholars() {
        return userRepository.findTop10ByRoleOrderByReputationScoreDesc(Role.DAY_SCHOLAR);
    }
}
