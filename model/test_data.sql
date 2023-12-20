/* user */
-- NOTE: password is hash of 'b0bb0'
INSERT INTO users(username, email, hashed_password, account_type, settings) VALUES
    ('mason k', 'mkline13@gmail.com', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'administrator', DEFAULT),
    ('mmm', 'mason@mason.mason', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'user', '{"display_name": "MeMeMe"}'),
    ('basin', 'basin@basin.com', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'user', '{"display_name": "Basin", "show_in_dir": true}'),
    ('scooby', 'scooby@gmail.com', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'user', '{"display_name": "Scooby", "show_in_dir": true, "description": "Sup my guys"}');

/* spaces */
-- The goal here is to make mkline13@gmail.com the tester account and to build spaces with various permissions to verify they work
INSERT INTO spaces(creator_id, name, settings, permissions) VALUES
    (email_to_user('mkline13@gmail.com'), 'Space-1', '{"description": "Look at this great space!"}', DEFAULT),
    (email_to_user('mason@mason.mason'), 'Space-2', '{"visible": true, "show_in_dir": true}', DEFAULT),
    (email_to_user('mason@mason.mason'), 'Space-3', '{"visible": true}', DEFAULT),
    (email_to_user('mason@mason.mason'), 'Space-4', DEFAULT, DEFAULT),
    (email_to_user('mason@mason.mason'), 'Space-5', '{"visible": true, "show_in_dir": true}', '{"view_members": 1, "view_posts": 1}'),
    (email_to_user('mason@mason.mason'), 'Space-6', '{"visible": true, "show_in_dir": true}', '{"view_members": 1, "view_posts": 1}');

INSERT INTO memberships(user_id, space_id, user_role) VALUES
    (email_to_user('mkline13@gmail.com'), 5, 1::role_t),
    (email_to_user('basin@basin.com'), 1, 2::role_t),
    (email_to_user('basin@basin.com'), 2, 2::role_t),
    (email_to_user('basin@basin.com'), 3, 2::role_t),
    (email_to_user('basin@basin.com'), 4, 2::role_t),
    (email_to_user('basin@basin.com'), 5, 2::role_t),
    (email_to_user('basin@basin.com'), 6, 2::role_t),
    (email_to_user('mason@mason.mason'), 1, 1::role_t),
    (email_to_user('scooby@gmail.com'), 1, 3::role_t),
    (email_to_user('scooby@gmail.com'), 2, 3::role_t),
    (email_to_user('scooby@gmail.com'), 3, 3::role_t),
    (email_to_user('scooby@gmail.com'), 4, 3::role_t),
    (email_to_user('scooby@gmail.com'), 5, 3::role_t),
    (email_to_user('scooby@gmail.com'), 6, 3::role_t);
    
INSERT INTO posts(author_id, space_id, allow_comments, allow_reactions, contents) VALUES
    (email_to_user('mkline13@gmail.com'), 1, false, false, 'Hello world!'),
    (email_to_user('basin@basin.com'), 1, false, false, 'Hi world!'),
    (email_to_user('mkline13@gmail.com'), 1, false, false, 'Gooby!'),
    (email_to_user('mason@mason.mason'), 1, false, false, 'Sup world!'),
    (email_to_user('mkline13@gmail.com'), 1, false, false, 'Ugggo!'),
    (email_to_user('mkline13@gmail.com'), 1, false, false, 'Where are my pants?');