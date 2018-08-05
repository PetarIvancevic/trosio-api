DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

CREATE TABLE "user" (
  id VARCHAR(255) NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (email)
);

CREATE TABLE category (
  id SERIAL,
  name TEXT NOT NULL,
  user_id VARCHAR(255) NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  PRIMARY KEY (id),
  UNIQUE (user_id, name)
);

CREATE TABLE wallet (
  id SERIAL,
  amount INTEGER NOT NULL DEFAULT 0,
  currency SMALLINT NOT NULL,
  name TEXT NOT NULL,
  paycheck_day SMALLINT NOT NULL,
  user_id VARCHAR(255) NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  PRIMARY KEY (id),
  CONSTRAINT paycheck_day_check CHECK (paycheck_day BETWEEN 1 AND 31)
);

CREATE TABLE "transaction" (
  id SERIAL,
  amount INTEGER NOT NULL,
  category_id INTEGER NOT NULL REFERENCES category (id) ON DELETE RESTRICT,
  comment TEXT,
  "date" DATE NOT NULL,
  place TEXT NOT NULL,
  wallet_id INTEGER NOT NULL REFERENCES wallet (id) ON DELETE CASCADE,
  PRIMARY KEY (id)
);
