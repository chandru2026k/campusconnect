package com.campusconnect.service;

import com.campusconnect.domain.Message;
import com.campusconnect.domain.Request;
import com.campusconnect.domain.RequestStatus;
import com.campusconnect.domain.User;
import com.campusconnect.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private RequestService requestService;

    @Autowired
    private UserService userService;

    public Message saveMessage(Long requestId, Long senderId, String body) {
        Request request = requestService.getRequest(requestId);
        
        // Chat is auto-locked for these states
        if (request.getStatus() == RequestStatus.CONFIRMED || 
            request.getStatus() == RequestStatus.RATED || 
            request.getStatus() == RequestStatus.CANCELLED || 
            request.getStatus() == RequestStatus.DISPUTED) {
            throw new IllegalStateException("Chat is locked for this request");
        }

        User sender = userService.getProfile(senderId);

        Message msg = Message.builder()
                .request(request)
                .sender(sender)
                .body(body)
                .build();

        return messageRepository.save(msg);
    }
    
    public List<Message> getChatHistory(Long requestId) {
        return messageRepository.findByRequestIdOrderBySentAtAsc(requestId);
    }
}
