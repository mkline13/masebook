
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
    display_name    VARCHAR(255)        DEFAULT '',
    show_in_dir     BOOLEAN             NOT NULL DEFAULT TRUE  /* whether or not the user will be shown in the server directory */
);

/*
 *  SPACES:
 *      Spaces are where users can pass back and forth messages to each other. They can either be used for direct messages, group pages, or even user walls.
 *  credential levels:
 *      - 0-63      server admins
 *      - 64-127    space admins
 *      - 128-191   space mods
 *      - 192-254   space members
 *      - 224-254   server users
 *      - 255       web users
 */
CREATE TABLE spaces (
    id                  SERIAL              PRIMARY KEY,
    owner_id            INT                 NOT NULL REFERENCES users ON DELETE CASCADE, /* user id of the owner of the space */
    name                VARCHAR(255)        NOT NULL,
    description         VARCHAR             DEFAULT '',
    creation_date       TIMESTAMP           NOT NULL DEFAULT now(),
    visibility_lvl      INT                 NOT NULL DEFAULT 192,  /* minimum credential level required to see content (posts + comments) in space */
    authorship_lvl      INT                 NOT NULL DEFAULT 192,  /* minimum credential level required to author posts in space */
    show_in_dir         BOOLEAN             NOT NULL DEFAULT false   /* whether or not the space will be shown in the server directory */
);

/*
 *  SPACE_PERMISSIONS:
 *      Defines a user's credential level within a particular space.
 */
CREATE TABLE space_permissions (
    id              SERIAL              PRIMARY KEY,
    space_id        INT                 NOT NULL REFERENCES spaces ON DELETE CASCADE,
    user_id         INT                 NOT NULL REFERENCES users ON DELETE CASCADE,
    user_lvl        INT                 NOT NULL  /* the credential level of this participant in the space */
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
 *  FUNCTIONS
 */

/* convert email address to user id */
CREATE OR REPLACE FUNCTION email_to_user(email_address text)
    RETURNS integer AS $$
        DECLARE
            user_id integer;
        BEGIN
            SELECT id INTO user_id FROM users WHERE email = email_address;
            RETURN user_id;
        END;
    $$ LANGUAGE plpgsql;