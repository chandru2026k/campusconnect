package com.campusconnect.repository;

import com.campusconnect.domain.Request;
import com.campusconnect.domain.RequestStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    List<Request> findByStatusAndDeadlineAtBefore(RequestStatus status, LocalDateTime deadline);

    @EntityGraph(attributePaths = {"requester"})
    List<Request> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"requester"})
    Optional<Request> findWithRequesterById(Long id);
}
