BEGIN;
INSERT INTO author (author_id,given_name,family_name,pen_name) VALUES
(1,'Леся','Українка',NULL),(2,'Іван','Франко',NULL),(3,'Тарас','Шевченко',NULL),
(4,'Ольга','Кобилянська',NULL),(5,NULL,NULL,'Мандрівник');
INSERT INTO edition (edition_id,title,language,publication_year,publisher_name) VALUES
(1,'Лісова пісня','uk',2020,'Навчальна книга'),
(2,'Захар Беркут','uk',2021,'Навчальна книга'),
(3,'Кобзар','uk',2019,'Класика'),
(4,'Земля','uk',2022,'Класика'),
(5,'Дорожні нотатки','uk',2023,'Обрій'),
(6,'Збірник народних казок','uk',NULL,NULL);
INSERT INTO authorship (author_id,edition_id) VALUES (1,1),(2,2),(3,3),(4,4),(5,5),(2,5);
INSERT INTO copy (inventory_number,edition_id) VALUES
(101,1),(102,1),(201,2),(202,2),(301,3),(401,4),(501,5),(601,6);
INSERT INTO reader (reader_id,given_name,family_name,phone) VALUES
(1,'Олена','Тестова','+380000000001'),(2,'Олег','Приклад','+380000000002'),
(3,'Марія','Демонстраційна','+380000000003'),(4,'Ірина','Тестова','+380000000001'),
(5,'Олена','Тестова','+380000000001'),(6,'Петро','Навчальний','+380000000006');
INSERT INTO loan (loan_id,reader_id,inventory_number,issued_on,due_on,returned_on) VALUES
(1,1,101,'2026-09-01','2026-09-15','2026-09-10'),
(2,2,101,'2026-09-10','2026-09-24','2026-09-26'),
(3,1,102,'2026-09-02','2026-09-16','2026-09-16'),
(4,3,201,'2026-09-05','2026-09-19','2026-09-05'),
(5,4,301,'2026-09-10','2026-09-24','2026-09-27'),
(6,2,401,'2026-10-01','2026-10-15','2026-10-14'),
(7,3,501,'2026-10-03','2026-10-17','2026-10-20'),
(8,1,101,'2026-10-10','2026-10-24',NULL),
(9,1,102,'2026-10-15','2026-10-29',NULL),
(10,5,601,'2026-10-05','2026-10-19','2026-10-10');
SELECT setval(pg_get_serial_sequence('author','author_id'),5);
SELECT setval(pg_get_serial_sequence('edition','edition_id'),6);
SELECT setval(pg_get_serial_sequence('reader','reader_id'),6);
SELECT setval(pg_get_serial_sequence('loan','loan_id'),10);
COMMIT;
