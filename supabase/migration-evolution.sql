-- ============================================
-- SegurosAR - Migración Evolution API
-- Ejecutar en Supabase SQL Editor DESPUÉS de migration.sql
-- ============================================

-- Tabla de configuración (clave-valor)
CREATE TABLE configuracion (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS permisivo (sin auth por ahora)
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on configuracion" ON configuracion FOR ALL USING (true) WITH CHECK (true);

-- Valores iniciales vacíos para Evolution API
INSERT INTO configuracion (clave, valor) VALUES
  ('evolution_api_url', ''),
  ('evolution_api_key', ''),
  ('evolution_instance_name', ''),
  ('webhook_activo', 'true'),
  ('webhook_secret', '');
