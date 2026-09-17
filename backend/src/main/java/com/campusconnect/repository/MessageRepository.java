package com.campusconnect.repository;

import com.campusconnect.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByRequestIdOrderBySentAtAsc(Long requestId);
}
