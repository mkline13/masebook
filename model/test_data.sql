/* user */
-- NOTE: password is hash of 'b0bb0'
INSERT INTO users(shortname, email, password, account_type, s_show_in_dir, s_profile_desc) VALUES
    ('mason_k', 'mason@gmail.com', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'administrator', true, 'itsa meee'),
    ('mmm', 'mason@mason.mason', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'user', true, 'itsa also me'),
    ('basin', 'basin@basin.com', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'user', DEFAULT, DEFAULT),
    ('scooby', 'scooby@gmail.com', '$2a$08$1lCvpuZe5PyJ8HQIqivj8.S45c9POZqG3uLMp7OkoQTZbpwuehtfW', 'user', true, DEFAULT);

/* spaces */
-- The goal here is to make mkline13@gmail.com the tester account and to build spaces with various permissions to verify they work
INSERT INTO spaces(creator_id, shortname, s_title, s_description, s_public, s_show_in_dir) VALUES
    (email_to_user('mason@gmail.com'), 'space1', 'Space-1', 'The First Space', DEFAULT, DEFAULT),
    (email_to_user('mason@mason.mason'), 'space2', 'Space-2', 'Second of Spaces', true, true),
    (email_to_user('mason@mason.mason'), 'space3', 'Space-3', 'Third Guy', true, false),
    (email_to_user('mason@mason.mason'), 'space4', 'Space-4', 'Froth', false, true),
    (email_to_user('mason@mason.mason'), 'space5', 'Space-5', 'Fiff', false, false),
    (email_to_user('mason@mason.mason'), 'space6', 'Space-6', 'Sixth Space', false, false);

INSERT INTO memberships(user_id, space_id, user_role) VALUES
    (email_to_user('mason@gmail.com'), 5, 1),
    (email_to_user('basin@basin.com'), 1, 2),
    (email_to_user('basin@basin.com'), 2, 2),
    (email_to_user('basin@basin.com'), 3, 2),
    (email_to_user('basin@basin.com'), 4, 2),
    (email_to_user('basin@basin.com'), 5, 2),
    (email_to_user('basin@basin.com'), 6, 2),
    (email_to_user('mason@mason.mason'), 1, 1),
    (email_to_user('scooby@gmail.com'), 1, 3),
    (email_to_user('scooby@gmail.com'), 2, 3),
    (email_to_user('scooby@gmail.com'), 3, 3),
    (email_to_user('scooby@gmail.com'), 4, 3),
    (email_to_user('scooby@gmail.com'), 5, 3),
    (email_to_user('scooby@gmail.com'), 6, 3);
    
INSERT INTO posts(author_id, space_id, allow_comments, allow_reactions, contents) VALUES
    (email_to_user('mason@gmail.com'), 1, false, false, 'Hello world!'),
    (email_to_user('basin@basin.com'), 1, false, false, 'Hi world!'),
    (email_to_user('mason@gmail.com'), 1, false, false, 'Gooby!'),
    (email_to_user('mason@mason.mason'), 1, false, false, 'Sup world!'),
    (email_to_user('mason@gmail.com'), 1, false, false, 'Ugggo!'),
    (email_to_user('mason@gmail.com'), 1, false, false, 'Where are my pants?');