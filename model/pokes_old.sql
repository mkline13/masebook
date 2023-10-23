
/* ===== POKE TABLE ===== */
CREATE TYPE poke_t AS ENUM ('poke', 'slap', 'tickle');

CREATE TABLE pokes (
    id          SERIAL          PRIMARY KEY,
    poker       INT             NOT NULL,
    pokee       INT             NOT NULL,
    poke_type   poke_t          NOT NULL DEFAULT 'poke',
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