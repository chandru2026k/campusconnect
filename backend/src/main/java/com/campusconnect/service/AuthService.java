package com.campusconnect.service;

import com.campusconnect.domain.AccountStatus;
import com.campusconnect.domain.Role;
import com.campusconnect.domain.User;
import com.campusconnect.dto.AuthResponse;
import com.campusconnect.dto.CompleteSignupRequest;
import com.campusconnect.dto.GoogleAuthRequest;
import com.campusconnect.repository.UserRepository;
import com.campusconnect.security.JwtUtil;
import com.campusconnect.security.UserDetailsImpl;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Value("${campusconnect.auth.google.client-id}")
    private String googleClientId;

    @Value("${campusconnect.auth.allowed-domains}")
    private List<String> allowedDomains;

    public AuthResponse verifyGoogleToken(GoogleAuthRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getCredential());
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                // Check allowed domains
                String domain = email.substring(email.indexOf("@") + 1);
                if (!allowedDomains.contains(domain)) {
                    throw new RuntimeException("Unauthorized email domain: " + domain);
                }

                User user = userRepository.findByEmail(email).orElse(null);
                
                if (user == null) {
                    // Create new user with UNASSIGNED role and PENDING status
                    user = User.builder()
                            .name(name)
                            .email(email)
                            .role(Role.UNASSIGNED)
                            .accountStatus(AccountStatus.PENDING)
                            .build();
                    user = userRepository.save(user);
                }

                // If user is suspended, block login
                if (user.getAccountStatus() == AccountStatus.SUSPENDED) {
                    throw new RuntimeException("Account is suspended.");
                }

                // Note: User can be PENDING if they haven't picked a role yet (UNASSIGNED)
                // or if they picked HOSTEL_STUDENT and are waiting for admin approval.
                // We'll allow generating a JWT anyway, but the frontend will enforce routes based on role/status.

                UserDetailsImpl userDetails = new UserDetailsImpl(user);
                String token = jwtUtil.generateToken(userDetails);

                return new AuthResponse(
                        token,
                        user.getId(),
                        user.getEmail(),
                        user.getRole()
                );

            } else {
                throw new RuntimeException("Invalid Google ID token.");
            }
        } catch (Exception e) {
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }

    public AuthResponse completeSignup(Long userId, CompleteSignupRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.UNASSIGNED) {
            throw new RuntimeException("User role is already assigned.");
        }

        if (request.getRole() == Role.HOSTEL_STUDENT && (request.getHostelId() == null || request.getHostelId().isBlank())) {
            throw new RuntimeException("Hostel ID is required for Hostel Students");
        }

        user.setRole(request.getRole());
        
        if (request.getRole() == Role.HOSTEL_STUDENT) {
            user.setHostelId(request.getHostelId());
            user.setAccountStatus(AccountStatus.PENDING); // Waits for admin
        } else if (request.getRole() == Role.DAY_SCHOLAR) {
            user.setAccountStatus(AccountStatus.ACTIVE);
        }

        user = userRepository.save(user);

        UserDetailsImpl userDetails = new UserDetailsImpl(user);
        String token = jwtUtil.generateToken(userDetails);

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getRole()
        );
    }
}
