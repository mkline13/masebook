
/* ===== USERS ===== */
CREATE TYPE account_status_t AS ENUM ('active', 'inactive');
CREATE TYPE account_type_t AS ENUM ('user', 'admin');
CREATE TABLE users (
    id              SERIAL              PRIMARY KEY,
    email           VARCHAR(255)        UNIQUE NOT NULL,
    hashed_password VARCHAR(255)        NOT NULL, /* TODO: check length of hashed passwords */
    display_name    VARCHAR(255)        DEFAULT '',
    account_status  account_status_t    NOT NULL DEFAULT 'active',
    account_type    account_type_t      NOT NULL DEFAULT 'user',
    show_in_dir     BOOLEAN             NOT NULL DEFAULT TRUE
);

/*
    SPACES:
        Spaces are where users can pass back and forth messages to each other. They can either be used for direct messages, group pages, or even user walls.

    space types:
        dm - direct messages
        page - users' personal pages, public pages, or group pages
*/
CREATE TYPE space_t AS ENUM ('dm', 'page');
CREATE TABLE spaces (
    id              SERIAL              PRIMARY KEY,
    owner           INT                 NOT NULL REFERENCES users,
    space_type      space_t             NOT NULL,
    title           VARCHAR(255)        NOT NULL,
    description     VARCHAR             DEFAULT ''
);

/*
    PARTICIPANTS:
        A table that shows which users have participated in a space.
*/
CREATE TYPE participant_t AS ENUM ('follower', 'owner', 'member');
CREATE TABLE participants (
    id              SERIAL              PRIMARY KEY,
    space_id        INT                 NOT NULL REFERENCES spaces ON DELETE CASCADE,
    user_id         INT                 NOT NULL REFERENCES users ON DELETE CASCADE,
    part_type       participant_t       NOT NULL
);

/*
    MESSAGES:
        Messages can be posted to spaces by users.
*/
CREATE TABLE messages (
    id              SERIAL              PRIMARY KEY,
    space_id        INT                 NOT NULL REFERENCES spaces ON DELETE CASCADE,
    sender_id       INT                 NOT NULL REFERENCES users,
    parent_id       INT                 REFERENCES messages ON DELETE CASCADE,
    contents        VARCHAR             NOT NULL
);

/* ===== POKE TABLE ===== */
CREATE TYPE poke_t AS ENUM ('poke', 'slap', 'tickle');
CREATE TABLE pokes (
    id              SERIAL              PRIMARY KEY,
    sender          INT                 NOT NULL REFERENCES users ON DELETE CASCADE,
    recipient       INT                 NOT NULL REFERENCES users ON DELETE CASCADE,
    poke_type       poke_t              NOT NULL
);