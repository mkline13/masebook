

/* user */
INSERT INTO users(email, hashed_password, display_name, account_type) VALUES
    ('mkline13@gmail.com', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'Mason Kline', 'admin'),
    ('mason@mason.mason', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'Meson Kline', 'user'),
    ('basin@basin.com', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'Basin Kline', 'user'),
    ('scooby@gmail.com', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'Scooby Dooby', 'user');

/* spaces */
INSERT INTO spaces(owner_id, name, description) VALUES
    (email_to_user('mkline13@gmail.com'), 'Cool Space', 'Wow this is such a cool space!'),
    (email_to_user('mkline13@gmail.com'), 'Dumb Space', 'Ugh, what a dumb space...'),
    (email_to_user('mkline13@gmail.com'), 'Just A Space', 'A totally normal space');