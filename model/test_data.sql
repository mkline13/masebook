

/* user */
INSERT INTO users(email, hashed_password, display_name, account_type, show_in_dir) VALUES
    ('mkline13@gmail.com', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'Mason Kline', 'administrator', true),
    ('mason@mason.mason', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'Meson Kline', 'user', true),
    ('basin@basin.com', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'Basin Kline', 'user', true),
    ('scooby@gmail.com', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'Scooby Dooby', 'user', true);

/* spaces */
SELECT create_space(email_to_user('mkline13@gmail.com'), 'A brand new space', 'So new! So cool!');
SELECT create_space(email_to_user('mkline13@gmail.com'), 'A cool space', 'Pretty cool!');
SELECT create_space(email_to_user('mkline13@gmail.com'), 'Ze best space', 'Oui oui!');
SELECT create_space(email_to_user('basin@basin.com'), 'A dumb space', 'Ugh, why??');
SELECT create_space(email_to_user('scooby@gmail.com'), 'Just a normal space', 'Nothing to see here :)');
SELECT create_space(email_to_user('scooby@gmail.com'), 'A pathetic waste of a space', 'Ewwwww');

INSERT INTO memberships(user_id, space_id) VALUES
    (email_to_user('mkline13@gmail.com'), 6),
    (email_to_user('mason@mason.mason'), 1),
    (email_to_user('mason@mason.mason'), 2),
    (email_to_user('mason@mason.mason'), 3),
    (email_to_user('basin@basin.com'), 1);

INSERT INTO memberships(user_id, space_id, role) VALUES
    (email_to_user('mkline13@gmail.com'), 4, 'administrator'),
    (email_to_user('mkline13@gmail.com'), 5, 'moderator');