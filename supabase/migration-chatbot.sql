-- ============================================
-- SegurosAR - Migración Chatbot IA
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- ============================================
-- A. Tabla de conversaciones (estado del chatbot)
-- ============================================

CREATE TABLE conversaciones (
  id TEXT PRIMARY KEY,
  asegurado_id TEXT NOT NULL REFERENCES asegurados(id),
  denuncia_id TEXT REFERENCES denuncias(id),
  paso_actual TEXT NOT NULL DEFAULT 'bienvenida',
  datos_parciales JSONB NOT NULL DEFAULT '{}',
  activa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversaciones_asegurado ON conversaciones(asegurado_id);
CREATE INDEX idx_conversaciones_activa ON conversaciones(activa);

ALTER TABLE conversaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on conversaciones" ON conversaciones FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- B. Relajar NOT NULL en denuncias
--    (los campos se llenan progresivamente durante la conversación)
-- ============================================

ALTER TABLE denuncias ALTER COLUMN tipo_siniestro DROP NOT NULL;
ALTER TABLE denuncias ALTER COLUMN fecha_hecho DROP NOT NULL;
ALTER TABLE denuncias ALTER COLUMN ubicacion DROP NOT NULL;
ALTER TABLE denuncias ALTER COLUMN descripcion DROP NOT NULL;

-- ============================================
-- C. Agregar external_id a mensajes (para deduplicación de WhatsApp)
-- ============================================

ALTER TABLE mensajes ADD COLUMN external_id TEXT;
CREATE INDEX idx_mensajes_external_id ON mensajes(external_id);

-- ============================================
-- D. Seed de configuración del chatbot
-- ============================================

INSERT INTO configuracion (clave, valor) VALUES
  ('chatbot_activo', 'true'),
  ('chatbot_modelo', 'claude-sonnet-4-20250514'),
  ('chatbot_system_prompt', 'Sos un asistente virtual de SegurosAR, una compañía de seguros argentina. Tu rol es ayudar a los asegurados a realizar denuncias de siniestros de forma guiada. Hablás en español rioplatense, de forma amable y profesional. Sé conciso en tus respuestas. No inventes información. Si el asegurado dice algo que no entendés, pedile que lo reformule.'),
  ('chatbot_mensaje_bienvenida', '¡Hola {nombre}! Soy el asistente virtual de SegurosAR. Voy a ayudarte a registrar tu denuncia de siniestro. Te voy a hacer algunas preguntas para completar la información necesaria.'),
  ('chatbot_prompt_tipo_siniestro', 'Preguntale al asegurado qué tipo de siniestro quiere denunciar. Los tipos válidos son: Robo, Choque vehicular, Incendio, Inundación, Daño por terceros, Otro. Si el asegurado describe la situación sin nombrar el tipo exacto, deducilo vos. Después de tu respuesta natural, incluí en la última línea un JSON así: {"extracted": true, "value": "Robo"} o {"extracted": false} si no pudiste determinar el tipo.'),
  ('chatbot_prompt_fecha_hecho', 'Preguntale al asegurado cuándo ocurrió el siniestro (fecha). Aceptá formatos como "ayer", "el lunes", "15/03/2026", etc. Convertí la respuesta a formato YYYY-MM-DD. Después de tu respuesta natural, incluí en la última línea: {"extracted": true, "value": "2026-03-15"} o {"extracted": false}.'),
  ('chatbot_prompt_ubicacion', 'Preguntale al asegurado dónde ocurrió el siniestro (dirección, zona, ciudad). Después de tu respuesta natural, incluí en la última línea: {"extracted": true, "value": "Av. Corrientes 1234, CABA"} o {"extracted": false}.'),
  ('chatbot_prompt_descripcion', 'Pedile al asegurado que describa con detalle qué fue lo que pasó. Necesitamos una descripción clara del siniestro. Si la descripción tiene al menos 10 palabras, considerala válida. Después de tu respuesta natural, incluí en la última línea: {"extracted": true, "value": "la descripción completa del asegurado"} o {"extracted": false}.'),
  ('chatbot_mensaje_confirmacion', '¡Listo! Tu denuncia fue registrada exitosamente con el número {numero_denuncia}. Un agente de SegurosAR va a revisar tu caso. Si necesitás algo más, no dudes en escribirnos. ¡Gracias!');
