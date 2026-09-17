package com.campusconnect.service;

import com.campusconnect.domain.Rating;
import com.campusconnect.domain.Request;
import com.campusconnect.domain.RequestStatus;
import com.campusconnect.domain.User;
import com.campusconnect.repository.RatingRepository;
import com.campusconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private RequestService requestService;

    @Autowired
    private UserRepository userRepository;

    public Rating rateRequest(Long requestId, Long raterId, Long rateeId, Integer stars, String comment) {
        Request request = requestService.getRequest(requestId);

        if (stars < 1 || stars > 5) {
            throw new IllegalArgumentException("Stars must be between 1 and 5");
        }

        requestService.updateStatus(requestId, RequestStatus.RATED, raterId);

        User rater = userRepository.findById(raterId).orElseThrow();
        User ratee = userRepository.findById(rateeId).orElseThrow();

        Rating rating = Rating.builder()
                .request(request)
                .rater(rater)
                .ratee(ratee)
                .stars(stars)
                .comment(comment)
                .build();

        Rating saved = ratingRepository.save(rating);
        updateReputationScore(ratee);
        return saved;
    }

    private void updateReputationScore(User user) {
        // Simplistic moving average or total average
        List<Rating> userRatings = ratingRepository.findAll().stream()
                .filter(r -> r.getRatee().getId().equals(user.getId()))
                .toList();
                
        if (!userRatings.isEmpty()) {
            double avg = userRatings.stream().mapToInt(Rating::getStars).average().orElse(5.0);
            user.setReputationScore(avg);
            userRepository.save(user);
        }
    }
}
