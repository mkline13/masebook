
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
    visible             BOOLEAN             DEFAULT false NOT NULL, -- can other server members see the space?
    show_in_dir         BOOLEAN             DEFAULT false NOT NULL,  -- will the space be displayed in the server directory
    
    /* PERMISSIONS */
    view_member_list    role_t      DEFAULT 'member',
    view_posts          role_t      DEFAULT 'member',
    create_posts        role_t      DEFAULT 'member',
    delete_posts        role_t      DEFAULT 'moderator' CHECK (delete_posts > 'member'::role_t),
    view_comments       role_t      DEFAULT 'member',
    create_comments     role_t      DEFAULT 'member',
    delete_comments     role_t      DEFAULT 'moderator' CHECK (delete_comments > 'member'::role_t)
);

CREATE TABLE space_permissions (
    space_id            INTEGER     NOT NULL REFERENCES spaces,
    privilege_id        INTEGER     NOT NULL REFERENCES privileges,
    level_required      INTEGER     NOT NULL,
)



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

DROP TRIGGER IF EXISTS assign_owner ON spaces;

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

/* load space info and calculate user's permissions */
CREATE OR REPLACE FUNCTION get_space_info_with_user_context(user_id_ INT, space_id_ INT)
RETURNS TABLE(
    id                      INT,
    creation_date           TIMESTAMP,
    name                    title_t,
    description             description_t,

    /* SETTINGS */
    is_visible              BOOLEAN,
    is_shown_in_dir         BOOLEAN,

    /* PERMISSIONS */
    can_view_member_list    BOOLEAN,
    can_view_posts          BOOLEAN,
    can_create_posts        BOOLEAN,
    can_delete_posts        BOOLEAN,
    can_view_comments       BOOLEAN,
    can_create_comments     BOOLEAN,
    can_delete_comments     BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id, s.creation_date, s.name, s.description,
        (m.user_role IS NOT NULL OR s.visible)              AS is_visible,
        (m.user_role IS NOT NULL OR s.show_in_dir)          AS is_shown_in_dir,
        coalesce(m.user_role >= s.view_member_list, false)  AS can_view_member_list,
        coalesce(m.user_role >= s.view_posts, false)        AS can_view_posts,
        coalesce(m.user_role >= s.create_posts, false)      AS can_create_posts,
        coalesce(m.user_role >= s.delete_posts, false)      AS can_delete_posts,
        coalesce(m.user_role >= s.view_comments, false)     AS can_view_comments,
        coalesce(m.user_role >= s.create_comments, false)   AS can_create_comments,
        coalesce(m.user_role >= s.delete_comments, false)   AS can_delete_comments
    FROM spaces s
    LEFT JOIN memberships m ON m.space_id=s.id AND m.user_id=user_id_
    WHERE s.id=space_id_;
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