
CREATE DOMAIN shortname_t AS VARCHAR(32);
CREATE DOMAIN email_t AS VARCHAR(320);          -- https://en.wikipedia.org/wiki/Email_address#Syntax
CREATE DOMAIN bcrypt_hash_t AS VARCHAR(60);     -- https://en.wikipedia.org/wiki/Bcrypt#Description

/*
 * USERS
 */
CREATE TYPE account_status_t AS ENUM ('active', 'inactive');  -- using enum because there may be additional statuses later
CREATE TYPE account_type_t AS ENUM ('user', 'administrator');
CREATE TABLE users (
    id              SERIAL              PRIMARY KEY,
    account_status  account_status_t    NOT NULL DEFAULT 'active',
    account_type    account_type_t      NOT NULL DEFAULT 'user',
    shortname       shortname_t         UNIQUE NOT NULL,
    email           email_t             UNIQUE NOT NULL,
    password        bcrypt_hash_t       NOT NULL,

    /* SETTINGS prefixed with 's_' for easier processing by JS */
    "settings.show_in_dir"     BOOLEAN             NOT NULL DEFAULT false,
    "settings.profile_desc"    VARCHAR             DEFAULT ''
);

/*
 *  SPACES:
 *      Spaces are where users can pass back and forth messages to each other. They can either be used for direct messages, group pages, or even user walls.
 */

CREATE TABLE roles (
    level           INTEGER              PRIMARY KEY,
    name            VARCHAR(16)          UNIQUE NOT NULL
);

INSERT INTO roles(level, name) VALUES
    (0, 'none'),
    (1, 'member'),
    (2, 'mod'),
    (3, 'admin'),
    (4, 'owner');

-- TODO: revoke INSERT, UPDATE, DELETE for all users on roles table??

CREATE TYPE space_status_t AS ENUM ('active', 'inactive');  -- using enum because there may be additional statuses later
CREATE TABLE spaces (
    id                  SERIAL              PRIMARY KEY,
    space_status        space_status_t      DEFAULT 'active',
    creation_date       TIMESTAMP           NOT NULL DEFAULT now(),
    creator_id          INTEGER             NOT NULL REFERENCES users,
    shortname           shortname_t         UNIQUE NOT NULL,

    /* SETTINGS */
    "settings.title"            VARCHAR(64)         UNIQUE NOT NULL,         -- title of the space as seen by users on the space page and in the directory
    "settings.description"      VARCHAR             DEFAULT '',              -- description of the space to be seen by users, hopefully will be part of the space search function in the future
    "settings.public"           BOOLEAN             NOT NULL DEFAULT false,  -- whether or not the space can be seen by non-members
    "settings.show_in_dir"      BOOLEAN             NOT NULL DEFAULT true,   -- if the space is public, determines if it can be seen in the directory by non-members
    
    /*
     * PERMISSIONS
     *     - each permission contains the minimum credential required to perform an action
     *     - NULL implies that no credential is required to perform an action
     */
    "permissions.view_members"      INTEGER             NOT NULL REFERENCES roles DEFAULT 1,
    "permissions.view_posts"        INTEGER             NOT NULL REFERENCES roles DEFAULT 1,
    "permissions.create_posts"      INTEGER             NOT NULL REFERENCES roles DEFAULT 1,
    "permissions.delete_posts"      INTEGER             NOT NULL REFERENCES roles DEFAULT 2,
    "permissions.view_comments"     INTEGER             NOT NULL REFERENCES roles DEFAULT 1,
    "permissions.create_comments"   INTEGER             NOT NULL REFERENCES roles DEFAULT 1,
    "permissions.delete_comments"   INTEGER             NOT NULL REFERENCES roles DEFAULT 2
);

/*
 *  MEMBERSHIPS:
 *      Defines a user's credential level within a particular space.
 */
CREATE TABLE memberships (
    user_id             INTEGER             NOT NULL REFERENCES users ON DELETE CASCADE,
    space_id            INTEGER             NOT NULL REFERENCES spaces ON DELETE CASCADE,
    user_role           INTEGER             NOT NULL REFERENCES roles DEFAULT 1,  /* the role of the user within a space */
    PRIMARY KEY (user_id, space_id)
);

CREATE OR REPLACE FUNCTION assign_owner() RETURNS TRIGGER AS $$
BEGIN
	INSERT INTO memberships(space_id, user_id, user_role) VALUES
		(NEW.id, NEW.creator_id, 4);
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_owner
    AFTER INSERT ON spaces
	FOR EACH ROW EXECUTE FUNCTION assign_owner();

/*
 *  FOLLOWS:
 *      Determines whether posts from a space will show up in the user's feed.
 */

CREATE TABLE follows (
    user_id             INTEGER             NOT NULL REFERENCES users ON DELETE CASCADE,
    space_id            INTEGER             NOT NULL REFERENCES spaces ON DELETE CASCADE,
    PRIMARY KEY (user_id, space_id)
);

/*
 *  POSTS:
 *      Posts can be posted to spaces by users.
 */
CREATE TABLE posts (
    id              SERIAL              PRIMARY KEY,
    space_id        INT                 NOT NULL REFERENCES spaces ON DELETE CASCADE,
    author_id       INT                 NOT NULL REFERENCES users,
    allow_comments  BOOLEAN             DEFAULT false NOT NULL,
    allow_reactions BOOLEAN             DEFAULT false NOT NULL,
    creation_date   TIMESTAMP           NOT NULL DEFAULT now(),
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
 *  TODO: DM_THREADS
 */


/*
 *  POKES
 */
CREATE TYPE poke_t AS ENUM ('poke', 'slap', 'tickle');
CREATE TABLE pokes (
    id              SERIAL              PRIMARY KEY,
    sender_id       INT                 NOT NULL REFERENCES users ON DELETE CASCADE,
    recipient_id    INT                 NOT NULL REFERENCES users ON DELETE CASCADE,
    poke_type       poke_t              NOT NULL,
    UNIQUE (sender_id, recipient_id)
);


/*
 *  FUNCTIONS / VIEWS
 */

/* convert email address to user id */
CREATE OR REPLACE FUNCTION email_to_user(email_address email_t)
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
RETURNS shortname_t AS $$
DECLARE
    shortname shortname_t;
BEGIN
    SELECT users.shortname INTO shortname FROM users WHERE users.id = user_id;
    RETURN user_name;
END;
$$ LANGUAGE plpgsql;
