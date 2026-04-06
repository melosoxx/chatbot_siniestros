-- ============================================
-- SegurosAR - Migración de Base de Datos
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Agentes
CREATE TABLE agentes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'agente')),
  activo BOOLEAN NOT NULL DEFAULT true,
  avatar TEXT
);

-- Asegurados
CREATE TABLE asegurados (
  id TEXT PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  dni TEXT NOT NULL UNIQUE,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL,
  numero_poliza TEXT NOT NULL
);

-- Denuncias
CREATE TABLE denuncias (
  id TEXT PRIMARY KEY,
  numero_denuncia TEXT NOT NULL UNIQUE,
  tipo_siniestro TEXT NOT NULL CHECK (tipo_siniestro IN ('Robo', 'Choque vehicular', 'Incendio', 'Inundación', 'Daño por terceros', 'Otro')),
  estado TEXT NOT NULL CHECK (estado IN ('Pendiente', 'En revisión', 'Documentación incompleta', 'Resuelto', 'Rechazado')),
  prioridad TEXT NOT NULL CHECK (prioridad IN ('Alta', 'Media', 'Baja')),
  descripcion TEXT NOT NULL,
  fecha_hecho DATE NOT NULL,
  ubicacion TEXT NOT NULL,
  agente_asignado_id TEXT REFERENCES agentes(id),
  asegurado_id TEXT NOT NULL REFERENCES asegurados(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Archivos
CREATE TABLE archivos (
  id TEXT PRIMARY KEY,
  denuncia_id TEXT NOT NULL REFERENCES denuncias(id) ON DELETE CASCADE,
  nombre_archivo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('imagen', 'documento')),
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mensajes
CREATE TABLE mensajes (
  id TEXT PRIMARY KEY,
  denuncia_id TEXT NOT NULL REFERENCES denuncias(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  direccion TEXT NOT NULL CHECK (direccion IN ('entrante', 'saliente')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notas internas
CREATE TABLE notas_internas (
  id TEXT PRIMARY KEY,
  denuncia_id TEXT NOT NULL REFERENCES denuncias(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  autor TEXT NOT NULL,
  autor_id TEXT NOT NULL REFERENCES agentes(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Historial de cambios
CREATE TABLE historial_cambios (
  id TEXT PRIMARY KEY,
  denuncia_id TEXT NOT NULL REFERENCES denuncias(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('estado', 'asignacion', 'prioridad', 'nota')),
  descripcion TEXT NOT NULL,
  autor TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Plantillas de mensajes
CREATE TABLE plantillas_mensajes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  contenido TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_denuncias_estado ON denuncias(estado);
CREATE INDEX idx_denuncias_tipo_siniestro ON denuncias(tipo_siniestro);
CREATE INDEX idx_denuncias_agente_asignado_id ON denuncias(agente_asignado_id);
CREATE INDEX idx_denuncias_asegurado_id ON denuncias(asegurado_id);
CREATE INDEX idx_denuncias_created_at ON denuncias(created_at);
CREATE INDEX idx_archivos_denuncia_id ON archivos(denuncia_id);
CREATE INDEX idx_mensajes_denuncia_id ON mensajes(denuncia_id);
CREATE INDEX idx_notas_internas_denuncia_id ON notas_internas(denuncia_id);
CREATE INDEX idx_historial_cambios_denuncia_id ON historial_cambios(denuncia_id);

-- RLS (permisivo por ahora, sin auth)
ALTER TABLE agentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE asegurados ENABLE ROW LEVEL SECURITY;
ALTER TABLE denuncias ENABLE ROW LEVEL SECURITY;
ALTER TABLE archivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_internas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_cambios ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantillas_mensajes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on agentes" ON agentes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on asegurados" ON asegurados FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on denuncias" ON denuncias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on archivos" ON archivos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on mensajes" ON mensajes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on notas_internas" ON notas_internas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on historial_cambios" ON historial_cambios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on plantillas_mensajes" ON plantillas_mensajes FOR ALL USING (true) WITH CHECK (true);
