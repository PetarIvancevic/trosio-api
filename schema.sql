DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal');

CREATE TABLE "user" (
  id VARCHAR(255) NOT NULL,
  email VARCHAR(254) NOT NULL,
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
  balance INTEGER DEFAULT 0,
  paycheck_amount INTEGER NOT NULL DEFAULT 0,
  currency SMALLINT NOT NULL,
  name TEXT NOT NULL,
  paycheck_day SMALLINT,
  user_id VARCHAR(255) NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
  PRIMARY KEY (id),
  CONSTRAINT paycheck_day_check CHECK (paycheck_day BETWEEN 1 AND 31),
  UNIQUE (user_id, name)
);

CREATE TABLE "transaction" (
  id SERIAL,
  "date" TIMESTAMP WITH TIME ZONE NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  category_id INTEGER REFERENCES category (id) ON DELETE RESTRICT,
  comment TEXT,
  place TEXT,
  type transaction_type,
  wallet_id INTEGER NOT NULL REFERENCES wallet (id) ON DELETE CASCADE,
  PRIMARY KEY (id)
);

CREATE TABLE cron_log (
  id SERIAL,
  "date" TIMESTAMP WITH TIME ZONE NOT NULL,
  PRIMARY KEY (id)
);
