package com.campusconnect.service;

import com.campusconnect.domain.RequestStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
public class RequestServiceTest {

    @InjectMocks
    private RequestService requestService;

    @Test
    void testValidTransitions() {
        assertDoesNotThrow(() -> requestService.validateTransition(RequestStatus.OPEN, RequestStatus.ACCEPTED));
        assertDoesNotThrow(() -> requestService.validateTransition(RequestStatus.OPEN, RequestStatus.CANCELLED));
        assertDoesNotThrow(() -> requestService.validateTransition(RequestStatus.ACCEPTED, RequestStatus.IN_PROGRESS));
        assertDoesNotThrow(() -> requestService.validateTransition(RequestStatus.IN_PROGRESS, RequestStatus.DELIVERED));
        assertDoesNotThrow(() -> requestService.validateTransition(RequestStatus.DELIVERED, RequestStatus.CONFIRMED));
        assertDoesNotThrow(() -> requestService.validateTransition(RequestStatus.CONFIRMED, RequestStatus.RATED));
        
        assertDoesNotThrow(() -> requestService.validateTransition(RequestStatus.ACCEPTED, RequestStatus.DISPUTED));
        assertDoesNotThrow(() -> requestService.validateTransition(RequestStatus.DISPUTED, RequestStatus.CANCELLED));
        assertDoesNotThrow(() -> requestService.validateTransition(RequestStatus.DISPUTED, RequestStatus.CONFIRMED));
    }

    @Test
    void testInvalidTransitions() {
        assertThrows(IllegalStateException.class, () -> requestService.validateTransition(RequestStatus.OPEN, RequestStatus.IN_PROGRESS));
        assertThrows(IllegalStateException.class, () -> requestService.validateTransition(RequestStatus.ACCEPTED, RequestStatus.DELIVERED));
        assertThrows(IllegalStateException.class, () -> requestService.validateTransition(RequestStatus.DELIVERED, RequestStatus.OPEN));
        assertThrows(IllegalStateException.class, () -> requestService.validateTransition(RequestStatus.CANCELLED, RequestStatus.OPEN));
        assertThrows(IllegalStateException.class, () -> requestService.validateTransition(RequestStatus.RATED, RequestStatus.CONFIRMED));
    }
}
