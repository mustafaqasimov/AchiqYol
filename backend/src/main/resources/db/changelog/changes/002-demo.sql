-- Liquibase runs this changeSet once, in a transaction.
-- All names and accessibility reviews are fictional demo examples.
INSERT INTO users (name, email) VALUES
    ('Demo Aysel', 'aysel@demo.example'),
    ('Demo Murad', 'murad@demo.example');

WITH inserted AS (
    INSERT INTO locations (name, description, latitude, longitude) VALUES
        ('DEMO — Sahil kafesi', 'Sınaq məlumatı: uydurma məkan və rəylər. Real əlçatanlıq məlumatı deyil.', 40.3700, 49.8440),
        ('DEMO — Şəhər kitabxanası', 'Sınaq məlumatı: uydurma məkan və rəylər. Real əlçatanlıq məlumatı deyil.', 40.3830, 49.8320),
        ('DEMO — Köhnə pilləkənli mağaza', 'Sınaq məlumatı: uydurma məkan və rəylər. Real əlçatanlıq məlumatı deyil.', 40.3990, 49.8510),
        ('DEMO — Yeni park', 'Sınaq məlumatı: uydurma məkan. Hələ qiymətləndirilməyib.', 40.4120, 49.8670)
    RETURNING id, name
)
INSERT INTO reviews (location_id, user_id, rating, comment)
SELECT l.id, u.id,
       CASE l.name
           WHEN 'DEMO — Sahil kafesi' THEN CASE WHEN u.email = 'aysel@demo.example' THEN 5 ELSE 4 END
           WHEN 'DEMO — Şəhər kitabxanası' THEN 3
           ELSE CASE WHEN u.email = 'aysel@demo.example' THEN 1 ELSE 2 END
       END,
       'DEMO: yalnız tətbiqi sınamaq üçün yaradılmış uydurma rəy.'
FROM inserted l
CROSS JOIN users u
WHERE l.name <> 'DEMO — Yeni park'
  AND u.email IN ('aysel@demo.example', 'murad@demo.example');
