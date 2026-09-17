package com.campusconnect.controller;

import com.campusconnect.domain.Message;
import com.campusconnect.service.MessageService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @Autowired
    private MessageService messageService;

    @MessageMapping("/chat/{requestId}")
    @SendTo("/topic/request/{requestId}")
    public Message sendMessage(@DestinationVariable Long requestId, ChatMessage incoming) {
        // In a real app, grab senderId from STOMP Principal. 
        // For prototype, assuming client sends senderId.
        return messageService.saveMessage(requestId, incoming.getSenderId(), incoming.getBody());
    }

    @Data
    public static class ChatMessage {
        private Long senderId;
        private String body;
    }
}
