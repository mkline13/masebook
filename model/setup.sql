
CREATE DOMAIN title_t AS VARCHAR(64);
CREATE DOMAIN description_t AS VARCHAR(256);

/*
 * USERS
 */
CREATE TYPE account_status_t AS ENUM ('active', 'inactive');
CREATE TYPE account_type_t AS ENUM ('user', 'admin');
CREATE TABLE users (
    id              SERIAL              PRIMARY KEY,
    email           VARCHAR(255)        UNIQUE NOT NULL,
    hashed_password VARCHAR(255)        NOT NULL, /* TODO: check length of hashed passwords */
    account_status  account_status_t    NOT NULL DEFAULT 'active',
    account_type    account_type_t      NOT NULL DEFAULT 'user',
    display_name    title_t             DEFAULT '',
    show_in_dir     BOOLEAN             NOT NULL DEFAULT true  /* whether or not the user will be shown in the server directory */
);

/*
 *  SPACES:
 *      Spaces are where users can pass back and forth messages to each other. They can either be used for direct messages, group pages, or even user walls.
 */
CREATE TABLE spaces (
    id                  SERIAL              PRIMARY KEY,
    name                title_t             NOT NULL,
    description         description_t       DEFAULT '',
    creation_date       TIMESTAMP           NOT NULL DEFAULT now(),
    /* SETTINGS */
    is_public           BOOLEAN             NOT NULL DEFAULT false,  /* whether or not users outside of the space can see the content within */
    is_visible_in_dir   BOOLEAN             NOT NULL DEFAULT false   /* whether or not the space will be shown in the server directory */
);

/* TODO: not sure if I'm going to use this */
CREATE DOMAIN key_t AS VARCHAR(16);
CREATE TABLE space_settings (
    space_id    INTEGER     NOT NULL REFERENCES spaces ON DELETE CASCADE,
    key         key_t       NOT NULL,
    value       INTEGER     NOT NULL
);


/*
 *  MEMBERSHIPS:
 *      Defines a user's credential level within a particular space.
 */
CREATE TYPE role_t AS ENUM ('member', 'moderator', 'administrator', 'owner');
CREATE TABLE memberships (
    user_id         INT                 NOT NULL REFERENCES users ON DELETE CASCADE,
    space_id        INT                 NOT NULL REFERENCES spaces ON DELETE CASCADE,
    role            role_t              NOT NULL DEFAULT 'member',  /* the role of the user within a space */
    CONSTRAINT pkey PRIMARY KEY (user_id, space_id)
    /* TODO add unique constraint to space_id / user_id so only one per user */
);

/*
 *  POSTS:
 *      Posts can be posted to spaces by users.
 */
CREATE TABLE posts (
    id              SERIAL              PRIMARY KEY,
    space_id        INT                 NOT NULL REFERENCES spaces ON DELETE CASCADE,
    author_id       INT                 NOT NULL REFERENCES users,
    allow_comments  BOOLEAN             NOT NULL,
    allow_reactions BOOLEAN             NOT NULL,
    creation_date   TIMESTAMP           NOT NULL,
    contents        VARCHAR             NOT NULL
);

/*
 *  COMMENTS:
 *      Comments are attached to posts
 */
 CREATE TABLE comments (
    id              SERIAL              PRIMARY KEY,
    post_id         INT                 NOT NULL REFERENCES posts ON DELETE CASCADE,
    response_to_id  INT                 REFERENCES posts ON DELETE CASCADE,
    author_id       INT                 NOT NULL REFERENCES users,
    creation_date   TIMESTAMP           NOT NULL,
    contents        VARCHAR             NOT NULL
 );

/*
 *  DM_THREADS
 */

/* TODO */

/*
 *  POKES
 */
CREATE TYPE poke_t AS ENUM ('poke', 'slap', 'tickle');
CREATE TABLE pokes (
    id              SERIAL              PRIMARY KEY,
    sender          INT                 NOT NULL REFERENCES users ON DELETE CASCADE,
    recipient       INT                 NOT NULL REFERENCES users ON DELETE CASCADE,
    poke_type       poke_t              NOT NULL
);


/*
 *  FUNCTIONS / VIEWS
 */

/* convert email address to user id */
CREATE OR REPLACE FUNCTION email_to_user(email_address text)
RETURNS INTEGER AS $$
DECLARE
    user_id INTEGER;
BEGIN
    SELECT id INTO user_id FROM users WHERE email = email_address;
    RETURN user_id;
END;
$$ LANGUAGE plpgsql;

/* convert user id to display name */
CREATE OR REPLACE FUNCTION user_to_name(user_id INT)
RETURNS title_t AS $$
DECLARE
    user_name title_t;
BEGIN
    SELECT display_name INTO user_name FROM users WHERE users.id = user_id;
    RETURN user_name;
END;
$$ LANGUAGE plpgsql;

/* space info to be displayed in the /space or /space_info pages */
CREATE OR REPLACE VIEW space_info AS
SELECT s.id, m.user_id AS owner_id, user_to_name(m.user_id) AS owner_name, s.name, s.description, s.creation_date,
    (SELECT COUNT(*) AS member_count FROM memberships WHERE space_id=s.id)
FROM spaces s
LEFT JOIN memberships m ON m.space_id = s.id
WHERE m.role = 'owner';

/* fn for creating a user and assigning them the owner role in a single transaction */
CREATE OR REPLACE FUNCTION create_space(owner_id INT, space_name title_t, space_desc description_t)
RETURNS INT AS $$
DECLARE new_space_id INT;
BEGIN
    BEGIN
        INSERT INTO spaces(name, description) VALUES (space_name, space_desc)
        RETURNING id INTO new_space_id;

        INSERT INTO memberships(space_id, user_id, role) VALUES (new_space_id, owner_id, 'owner');
    EXCEPTION WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
    END;
    RETURN new_space_id;
END;
$$ LANGUAGE plpgsql;

/* get user's member spaces */

CREATE OR REPLACE FUNCTION get_member_spaces(user_id_ INT)
RETURNS TABLE(
    user_id INT,
    role role_t,
    id INT,
    name title_t,
    description description_t,
    creation_date TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.user_id, m.role, s.id, s.name, s.description, s.creation_date
    FROM spaces s
    LEFT JOIN memberships m ON m.space_id = s.id
    WHERE m.user_id = user_id_;
END;
$$ LANGUAGE plpgsql;