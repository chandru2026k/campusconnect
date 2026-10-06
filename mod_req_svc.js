const fs = require('fs');
let code = fs.readFileSync('backend/src/main/java/com/campusconnect/service/RequestService.java', 'utf8');

code = code.replace(
    'case OPEN -> target == RequestStatus.ACCEPTED || target == RequestStatus.CANCELLED;',
    'case OPEN -> target == RequestStatus.ACCEPTED || target == RequestStatus.CANCELLED || target == RequestStatus.EXPIRED;'
);

const scheduledMethod = 
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 60000)
    public void expireOldRequests() {
        List<Request> expired = requestRepository.findByStatusAndDeadlineAtBefore(RequestStatus.OPEN, java.time.LocalDateTime.now());
        for (Request req : expired) {
            req.setStatus(RequestStatus.EXPIRED);
            requestRepository.save(req);
        }
    }
;

code = code.replace(
    'public Request createRequest(Request request) {',
    scheduledMethod + '\n    public Request createRequest(Request request) {'
);

fs.writeFileSync('backend/src/main/java/com/campusconnect/service/RequestService.java', code);
