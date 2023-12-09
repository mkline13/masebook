/* user */
-- NOTE: password is hash of 'b0bb0'
INSERT INTO users(email, hashed_password, display_name, account_type, show_in_dir) VALUES
    ('mkline13@gmail.com', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'Mason Kline', 'administrator', true),
    ('mason@mason.mason', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'Meson Kline', 'user', true),
    ('basin@basin.com', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'Basin Kline', 'user', true),
    ('scooby@gmail.com', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'Scooby Dooby', 'user', true);

/* spaces */
INSERT INTO spaces(creator_id, name, description, visible, show_in_dir) VALUES
    (email_to_user('mkline13@gmail.com'), 'A brand new space', 'So new! So cool!', false, true),
    (email_to_user('mkline13@gmail.com'), 'A cool space', 'Pretty cool!', false, false),
    (email_to_user('mason@mason.mason'), 'Ze best space', 'Oui oui!', true, true),
    (email_to_user('basin@basin.com'), 'A dumb space', 'Ugh, why??', true, true),
    (email_to_user('scooby@gmail.com'), 'Just a normal space', 'Nothing to see here :)', false, false),
    (email_to_user('scooby@gmail.com'), 'A pathetic waste of a space', 'Ewwwww', false, true);

INSERT INTO memberships(user_id, space_id) VALUES
    (email_to_user('mkline13@gmail.com'), 6),
    (email_to_user('mason@mason.mason'), 1),
    (email_to_user('mason@mason.mason'), 2),
    (email_to_user('basin@basin.com'), 1);

INSERT INTO memberships(user_id, space_id, user_role) VALUES
    (email_to_user('mkline13@gmail.com'), 4, 'administrator');

INSERT INTO posts(author_id, space_id, allow_comments, allow_reactions, contents) VALUES
    (email_to_user('mkline13@gmail.com'), 1, false, false, 'Hello world!'),
    (email_to_user('basin@basin.com'), 1, false, false, 'Hi world!'),
    (email_to_user('mkline13@gmail.com'), 1, false, false, 'Gooby!'),
    (email_to_user('mason@mason.mason'), 1, false, false, 'Sup world!'),
    (email_to_user('mkline13@gmail.com'), 1, false, false, 'Ugggo!'),
    (email_to_user('mkline13@gmail.com'), 1, false, false, 'Where are my pants?');