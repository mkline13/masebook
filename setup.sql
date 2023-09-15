
/* CLEAN UP */
DROP TABLE IF EXISTS pokes CASCADE;
DROP TABLE IF EXISTS users CASCADE;


/* ===== USERS TABLE ===== */
DROP TYPE IF EXISTS account_status_t;

CREATE TYPE account_status_t AS ENUM ('active', 'inactive');

CREATE TABLE users (
    id              SERIAL              PRIMARY KEY,
    email           VARCHAR(255)        UNIQUE NOT NULL,
    display_name    VARCHAR(255)        DEFAULT '',
    real_name       VARCHAR(255)        NOT NULL,
    phone_no        VARCHAR(15)         NOT NULL,
    account_status  account_status_t    NOT NULL DEFAULT 'active'
);


/* TEST DATA - move to separate file eventually */
INSERT INTO users(email, real_name, phone_no) VALUES
    ('mkline13@gmail.com', 'Mason Kline', '15417293753'),
    ('mason@mason.mason', 'Mason Kline', '15417293753'),
    ('basin@basin.com', 'Basin Kline', '15417293753'),
    ('scooby@gmail.com', 'Scooby Dooby', '15417293753');

SELECT * FROM users;


/* ===== POKE TABLE ===== */
CREATE TYPE poke_t AS ENUM ('basic', 'soft', 'hard', 'sneaky', 'punch', 'slap', 'tickle');

CREATE TABLE pokes (
    id          SERIAL          PRIMARY KEY,
    poker       INT             NOT NULL,
    pokee       INT             NOT NULL,
    poke_type   poke_t          NOT NULL DEFAULT 'basic',
    CONSTRAINT fk_to
        FOREIGN KEY(poker)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_from
        FOREIGN KEY(pokee)
        REFERENCES users(id)
        ON DELETE CASCADE
);

/* this view gives poker and pokee emails for each poke as well as poke_type */
CREATE VIEW poke_info AS
    SELECT
        p.id AS poke_id,
        poker_user.email AS poker,
        pokee_user.email AS pokee,
        p.poke_type AS poke_type
    FROM
        pokes p
    INNER JOIN
        users poker_user
    ON
        p.poker = poker_user.id
    INNER JOIN
        users pokee_user
    ON
        p.pokee = pokee_user.id;


/* TEST DATA - move to separate file eventually */
INSERT INTO pokes(poker, pokee) VALUES
    (1, 2),
    (2, 1),
    (3, 1),
    (4, 1);

SELECT * FROM poke_info WHERE pokee = 'mkline13@gmail.com';