INSERT INTO
  "user" (id, name, email)
  VALUES (1, 'first user', 'first@test.test');
INSERT INTO
  "user" (id, name, email)
  VALUES (2, 'second user', 'second@test.test');
INSERT INTO
  "user" (id, name, email)
  VALUES (3, 'third user', 'third@test.test');

INSERT INTO
  wallet (currency, amount, user_id)
  VALUES (10, 1000, 1);
INSERT INTO
  wallet (currency, amount, user_id)
  VALUES (20, 11000, 2);
INSERT INTO
  wallet (currency, amount, user_id)
  VALUES (30, 1050, 3);
INSERT INTO
  wallet (currency, amount, user_id)
  VALUES (20, 1200, 1);

INSERT INTO
  expense (category, amount, date, place, wallet_id)
  VALUES (10, 11400, '2017-12-12', 'Kaufland', 1);
INSERT INTO
  expense (category, amount, date, place, wallet_id)
  VALUES (20, 1200, '2018-04-01', 'Tommy', 2);
INSERT INTO
  expense (category, amount, date, place, wallet_id)
  VALUES (30, 5000, '2017-09-22', 'Konzum', 3);
INSERT INTO
  expense (category, amount, date, place, wallet_id)
  VALUES (20, 3000, '2016-11-22', 'Tommy', 1);
INSERT INTO
  expense (category, amount, date, place, wallet_id)
  VALUES (30, 2000, '2018-02-16', 'Konzum', 2);
INSERT INTO
  expense (category, amount, date, place, wallet_id)
  VALUES (10, 1000, '2018-03-13', 'Kaufland', 3);