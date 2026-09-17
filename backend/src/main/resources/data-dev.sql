INSERT INTO users (email, name, password_hash, role, account_status, reputation_score) VALUES ('admin@college.edu', 'Admin User', '$2a$10$xyz', 'ADMIN', 'ACTIVE', 5.0);
INSERT INTO users (email, name, password_hash, role, account_status, hostel_id, reputation_score) VALUES ('hostel1@college.edu', 'Hostel Student 1', '$2a$10$xyz', 'HOSTEL_STUDENT', 'ACTIVE', 'H-A-101', 5.0);
INSERT INTO users (email, name, password_hash, role, account_status, hostel_id, reputation_score) VALUES ('hostel2@college.edu', 'Hostel Student 2', '$2a$10$xyz', 'HOSTEL_STUDENT', 'PENDING', 'H-B-202', 5.0);
INSERT INTO users (email, name, password_hash, role, account_status, reputation_score) VALUES ('day1@college.edu', 'Day Scholar 1', '$2a$10$xyz', 'DAY_SCHOLAR', 'ACTIVE', 4.8);
INSERT INTO users (email, name, password_hash, role, account_status, reputation_score) VALUES ('day2@college.edu', 'Day Scholar 2', '$2a$10$xyz', 'DAY_SCHOLAR', 'ACTIVE', 5.0);

INSERT INTO requests (requester_id, category, title, description, is_emergency, status, location_hint, deadline_at) VALUES (2, 'FOOD', 'Pizza pickup', 'Please bring pizza from main gate', false, 'OPEN', 'MAIN_GATE', '2026-12-31 23:59:59');
INSERT INTO requests (requester_id, category, title, description, is_emergency, status, location_hint, deadline_at) VALUES (2, 'MEDICINE', 'Paracetamol', 'Fever, need medicine urgently', true, 'OPEN', 'HOSTEL_BLOCK_A', '2026-12-31 23:59:59');
