ALTER TABLE locations ADD COLUMN ai_color VARCHAR(6) CHECK (ai_color IN ('GREEN', 'YELLOW', 'RED', 'GREY'));
ALTER TABLE locations ADD COLUMN ai_summary VARCHAR(2000);
