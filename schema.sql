DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

CREATE TABLE "user" (
  id VARCHAR(254) NOT NULL,
  name VARCHAR(254) NOT NULL,
  email VARCHAR(254) NOT NULL,
  CONSTRAINT user_pk PRIMARY KEY (id),
  CONSTRAINT email_unique UNIQUE (email)
);

CREATE TABLE wallet (
  id SERIAL,
  currency SMALLINT NOT NULL,
  paycheck_day SMALLINT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  user_id VARCHAR(254) NOT NULL,
  CONSTRAINT wallet_pk PRIMARY KEY (id),
  CONSTRAINT wallet_user_fk FOREIGN KEY (user_id) REFERENCES "user" (id) ON DELETE CASCADE,
  CONSTRAINT paycheck_day_chk CHECK (paycheck_day BETWEEN 1 AND 30)
);

CREATE TABLE expense (
  id SERIAL,
  category SMALLINT NOT NULL,
  amount INTEGER NOT NULL,
  date DATE NOT NULL,
  place VARCHAR(60) NOT NULL,
  wallet_id INTEGER NOT NULL,
  CONSTRAINT expense_pk PRIMARY KEY (id),
  CONSTRAINT expense_wallet_fk FOREIGN KEY (wallet_id) REFERENCES wallet (id) ON DELETE CASCADE
);
