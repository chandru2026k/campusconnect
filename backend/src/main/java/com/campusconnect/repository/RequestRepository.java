package com.campusconnect.repository;

import com.campusconnect.domain.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    java.util.List<Request> findByStatusAndDeadlineAtBefore(com.campusconnect.domain.RequestStatus status, java.time.LocalDateTime deadline);
}
