CREATE DOMAIN title_t AS VARCHAR(64);
CREATE DOMAIN description_t AS VARCHAR(256);

/*
 * USERS
 */
CREATE TYPE account_status_t AS ENUM ('active', 'inactive');
CREATE TYPE account_type_t AS ENUM ('user', 'administrator');
CREATE TABLE users (
    id              SERIAL              PRIMARY KEY,
    email           VARCHAR(255)        UNIQUE NOT NULL,
    hashed_password VARCHAR(255)        NOT NULL, -- TODO: check length of hashed passwords
    account_status  account_status_t    NOT NULL DEFAULT 'active',
    account_type    account_type_t      NOT NULL DEFAULT 'user',
    display_name    title_t             NOT NULL,
    description     description_t       DEFAULT '',
    show_in_dir     BOOLEAN             NOT NULL  -- whether or not the user will be shown in the server directory
);

/*
 *  SPACES:
 *      Spaces are where users can pass back and forth messages to each other. They can either be used for direct messages, group pages, or even user walls.
 */
CREATE TYPE role_t AS ENUM ('member', 'moderator', 'administrator', 'owner');
CREATE TABLE spaces (
    id                  SERIAL              PRIMARY KEY,
    creation_date       TIMESTAMP           NOT NULL DEFAULT now(),
    creator_id          INTEGER             NOT NULL REFERENCES users,
    name                title_t             NOT NULL,
    description         description_t       DEFAULT '',

    /* SETTINGS */
    visible             BOOLEAN             DEFAULT false NOT NULL,     -- can other server members see the space?
    show_in_dir         BOOLEAN             DEFAULT false NOT NULL      -- will the space be displayed in the server directory
);

CREATE TABLE space_actions ( -- this table should not be modified at runtime
    action                  title_t         PRIMARY KEY,
    description             description_t   NOT NULL,
    default_role_required   role_t          NOT NULL        -- the minimum role required by the server for this privilege (also the default role)
);

INSERT INTO space_actions VALUES
    ('view_member_list', 'Who can view members of this space?', 'member'),
    ('view_posts', 'Who can view posts in this space?', 'member'),
    ('create_posts', 'Who can create posts in this space?', 'member'),
    ('delete_posts', 'Who can delete posts in this space?', 'moderator'),
    ('view_comments', 'Who can view comments on posts in this space?', 'member'),
    ('create_comments', 'Who can create comments on posts in this space?', 'member'),
    ('delete_comments', 'Who can delete comments on posts in this space?', 'moderator');

CREATE TABLE space_permissions(
    space_id            INT         NOT NULL REFERENCES spaces ON DELETE CASCADE,
    action              title_t     NOT NULL REFERENCES space_actions ON DELETE CASCADE,
    role_required       role_t      NOT NULL,
    CONSTRAINT sp_pkey PRIMARY KEY (space_id, action)
);

/*
 *  MEMBERSHIPS:
 *      Defines a user's credential level within a particular space.
 */
CREATE TABLE memberships (
    user_id             INT             NOT NULL REFERENCES users ON DELETE CASCADE,
    space_id            INT             NOT NULL REFERENCES spaces ON DELETE CASCADE,
    user_role           role_t          NOT NULL DEFAULT 'member',  /* the role of the user within a space */
    show_in_profile     BOOLEAN         NOT NULL DEFAULT false,  -- TODO: implement this in front-end
    CONSTRAINT pkey     PRIMARY KEY (user_id, space_id)
);

CREATE OR REPLACE FUNCTION assign_owner() RETURNS TRIGGER AS $$
BEGIN
	INSERT INTO memberships(space_id, user_id, user_role) VALUES
		(NEW.id, NEW.creator_id, 'owner');
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assign_owner AFTER INSERT ON spaces
	FOR EACH ROW EXECUTE FUNCTION assign_owner();

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
    (SELECT COUNT(*) FROM memberships WHERE space_id=s.id) AS member_count
FROM spaces s
LEFT JOIN memberships m ON m.space_id = s.id AND m.user_role = 'owner';

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
    SELECT m.user_id, m.user_role, s.id, s.name, s.description, s.creation_date
    FROM spaces s
    LEFT JOIN memberships m ON m.space_id = s.id
    WHERE m.user_id = user_id_
    ORDER BY m.user_role, s.name;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION list_server_spaces(user_id_ INT)
RETURNS TABLE(
    id          INT,
    name        title_t,
    user_role   role_t
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.id, s.name, m.user_role FROM spaces s
    LEFT JOIN memberships m ON m.space_id = s.id AND m.user_id = user_id_
    WHERE (m.user_role IS NOT NULL OR s.visible AND s.show_in_dir)
    ORDER BY m.user_role DESC NULLS LAST, s.name ASC;
END;
$$ LANGUAGE plpgsql;