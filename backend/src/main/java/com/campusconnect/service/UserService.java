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

    public void suspendUser(Long userId) {
        User user = getProfile(userId);
        user.setAccountStatus(AccountStatus.SUSPENDED);
        userRepository.save(user);
    }
}
