DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

CREATE TABLE "user" (
  id INTEGER NOT NULL,
  name VARCHAR(254) NOT NULL,
  email VARCHAR(254) NOT NULL,
  CONSTRAINT user_pk PRIMARY KEY (id)
);

CREATE TABLE wallet (
  id SERIAL,
  currency SMALLINT NOT NULL,
  paycheck_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  amount INTEGER NOT NULL DEFAULT 0,
  user_id INTEGER NOT NULL,
  CONSTRAINT wallet_pk PRIMARY KEY (id),
  CONSTRAINT user_fk FOREIGN KEY (user_id) REFERENCES "user" (id)
);

CREATE TABLE expense (
  id SERIAL,
  category SMALLINT NOT NULL,
  amount INTEGER NOT NULL,
  date DATE NOT NULL,
  place VARCHAR(60) NOT NULL,
  wallet_id INTEGER NOT NULL,
  CONSTRAINT expense_pk PRIMARY KEY (id),
  CONSTRAINT wallet_fk FOREIGN KEY (wallet_id) REFERENCES wallet (id)
);
