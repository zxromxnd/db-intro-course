SELECT 'author' AS table_name, count(*) AS rows FROM author
UNION ALL SELECT 'edition',count(*) FROM edition
UNION ALL SELECT 'authorship',count(*) FROM authorship
UNION ALL SELECT 'copy',count(*) FROM copy
UNION ALL SELECT 'reader',count(*) FROM reader
UNION ALL SELECT 'loan',count(*) FROM loan ORDER BY table_name;
SELECT * FROM author ORDER BY author_id;
SELECT * FROM edition ORDER BY edition_id;
SELECT * FROM authorship ORDER BY author_id,edition_id;
SELECT * FROM copy ORDER BY inventory_number;
SELECT * FROM reader ORDER BY reader_id;
SELECT * FROM loan ORDER BY loan_id;
