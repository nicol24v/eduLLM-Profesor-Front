import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card, CardContent, Button, TextField, IconButton,
  Checkbox, FormControlLabel, Divider, Tooltip,
  CircularProgress, Typography,
} from '@mui/material';
import { ArrowBack, Save, Add, Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useCuestionario } from './hooks/useCuestionarios';
import cuestionarioService from '../../services/cuestionarioService';
import materiaService from '../../services/materiaService';
import { useQuery } from '@tanstack/react-query';

const newOpcion = () => ({ texto: '', es_correcta: false, orden: null });
const newPregunta = () => ({
  texto: '',
  tipo: 'single_choice',
  cooldown: 5,
  tiempo_limite: 20,
  image_url: '',
  video_url: '',
  audio_url: '',
  opciones: [newOpcion(), newOpcion()],
});

function OpcionEditor({ opcion, index, onChange, onDelete }) {
  return (
    <div className="flex items-center gap-2">
      <TextField
        size="small"
        placeholder={`Respuesta ${index + 1}`}
        value={opcion.texto}
        onChange={(e) => onChange({ ...opcion, texto: e.target.value })}
        sx={{ flex: 1 }}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={opcion.es_correcta}
            onChange={(e) => onChange({ ...opcion, es_correcta: e.target.checked })}
            size="small"
            color="success"
          />
        }
        label={<span className="text-xs text-slate-600">Correcta</span>}
        sx={{ m: 0, ml: 0.5 }}
      />
      <Tooltip title="Eliminar respuesta">
        <IconButton size="small" onClick={onDelete} sx={{ color: '#ef4444' }}>
          <Delete fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );
}

function PreguntaEditor({ pregunta, index, onChange, onDelete }) {
  const update = (field, value) => onChange({ ...pregunta, [field]: value });

  const updateOpcion = (opIndex, updated) => {
    const opciones = pregunta.opciones.map((o, i) => (i === opIndex ? updated : o));
    onChange({ ...pregunta, opciones });
  };

  const removeOpcion = (opIndex) => {
    onChange({ ...pregunta, opciones: pregunta.opciones.filter((_, i) => i !== opIndex) });
  };

  const addOpcion = () => {
    onChange({ ...pregunta, opciones: [...pregunta.opciones, newOpcion()] });
  };

  return (
    <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <Typography variant="subtitle2" fontWeight={700} color="#1e293b">
            Pregunta {index + 1}
          </Typography>
          <Tooltip title="Eliminar pregunta">
            <IconButton size="small" onClick={onDelete} sx={{ color: '#ef4444' }}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>

        {/* Question text */}
        <TextField
          label="Texto de la pregunta"
          multiline
          minRows={2}
          fullWidth
          size="small"
          value={pregunta.texto}
          onChange={(e) => update('texto', e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Timers */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <TextField
            label="Cooldown (segundos)"
            type="number"
            size="small"
            value={pregunta.cooldown}
            onChange={(e) => update('cooldown', Number(e.target.value))}
            inputProps={{ min: 0, max: 60 }}
          />
          <TextField
            label="Tiempo de respuesta (seg)"
            type="number"
            size="small"
            value={pregunta.tiempo_limite}
            onChange={(e) => update('tiempo_limite', Number(e.target.value))}
            inputProps={{ min: 5, max: 120 }}
          />
        </div>

        {/* Media URLs */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <TextField
            label="URL de imagen (opcional)"
            size="small"
            value={pregunta.image_url}
            onChange={(e) => update('image_url', e.target.value)}
            placeholder="https://..."
          />
          <TextField
            label="URL de video (opcional)"
            size="small"
            value={pregunta.video_url}
            onChange={(e) => update('video_url', e.target.value)}
            placeholder="https://..."
          />
        </div>
        <TextField
          label="URL de audio (opcional)"
          size="small"
          fullWidth
          value={pregunta.audio_url}
          onChange={(e) => update('audio_url', e.target.value)}
          placeholder="https://..."
          sx={{ mb: 3 }}
        />

        <Divider sx={{ mb: 2 }} />

        {/* Answers */}
        <div className="flex items-center justify-between mb-2">
          <Typography variant="body2" fontWeight={600} color="#475569">Respuestas</Typography>
          <Button size="small" startIcon={<Add />} onClick={addOpcion} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>
            Agregar respuesta
          </Button>
        </div>
        <p className="text-xs text-slate-400 mb-3">Marca una o más respuestas como correctas.</p>

        <div className="space-y-2">
          {pregunta.opciones.map((op, opIdx) => (
            <OpcionEditor
              key={opIdx}
              opcion={op}
              index={opIdx}
              onChange={(updated) => updateOpcion(opIdx, updated)}
              onDelete={() => removeOpcion(opIdx)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CuestionarioEditorPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { data: existing, isLoading: loadingExisting } = useCuestionario(id ? Number(id) : null);

  const { data: materias = [] } = useQuery({
    queryKey: ['materias'],
    queryFn: materiaService.getAll,
  });

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [profesorMateriaId, setProfesorMateriaId] = useState('');
  const [preguntas, setPreguntas] = useState([newPregunta()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setTitulo(existing.titulo || '');
      setDescripcion(existing.descripcion || '');
      setProfesorMateriaId(existing.profesor_materia_id?.toString() || '');
      if (existing.tbl_t_pregunta?.length) {
        setPreguntas(
          existing.tbl_t_pregunta.map((p) => ({
            texto: p.texto || '',
            tipo: p.tipo || 'single_choice',
            cooldown: p.cooldown ?? 5,
            tiempo_limite: p.tiempo_limite ?? 20,
            image_url: p.image_url || '',
            video_url: p.video_url || '',
            audio_url: p.audio_url || '',
            opciones: (p.tbl_t_opcion || []).map((o) => ({
              texto: o.texto || '',
              es_correcta: o.es_correcta || false,
              orden: o.orden ?? null,
            })),
          }))
        );
      }
    }
  }, [existing]);

  const addPregunta = () => setPreguntas((prev) => [...prev, newPregunta()]);

  const updatePregunta = (idx, updated) =>
    setPreguntas((prev) => prev.map((p, i) => (i === idx ? updated : p)));

  const removePregunta = (idx) =>
    setPreguntas((prev) => prev.filter((_, i) => i !== idx));

  const validate = () => {
    if (!titulo.trim()) return 'El título es obligatorio.';
    if (!profesorMateriaId) return 'Selecciona una materia.';
    if (preguntas.length === 0) return 'Agrega al menos una pregunta.';
    for (let i = 0; i < preguntas.length; i++) {
      const p = preguntas[i];
      if (!p.texto.trim()) return `La pregunta ${i + 1} necesita texto.`;
      if (p.opciones.length < 2) return `La pregunta ${i + 1} necesita al menos 2 respuestas.`;
      if (!p.opciones.some((o) => o.es_correcta)) return `La pregunta ${i + 1} necesita al menos 1 respuesta correcta.`;
      for (let j = 0; j < p.opciones.length; j++) {
        if (!p.opciones[j].texto.trim()) return `Respuesta ${j + 1} de la pregunta ${i + 1} está vacía.`;
      }
    }
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) { enqueueSnackbar(error, { variant: 'warning' }); return; }

    const payload = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      profesor_materia_id: Number(profesorMateriaId),
      preguntas: preguntas.map((p) => ({
        texto: p.texto.trim(),
        tipo: p.tipo,
        cooldown: p.cooldown,
        tiempo_limite: p.tiempo_limite,
        image_url: p.image_url.trim() || undefined,
        video_url: p.video_url.trim() || undefined,
        audio_url: p.audio_url.trim() || undefined,
        opciones: p.opciones.map((o, oi) => ({
          texto: o.texto.trim(),
          orden: oi + 1,
          es_correcta: o.es_correcta,
        })),
      })),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await cuestionarioService.update(Number(id), payload);
        enqueueSnackbar('Cuestionario actualizado', { variant: 'success' });
      } else {
        await cuestionarioService.create(payload);
        enqueueSnackbar('Cuestionario creado', { variant: 'success' });
      }
      navigate('/cuestionarios');
    } catch (err) {
      enqueueSnackbar(err.response?.data?.message || 'Error al guardar', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && loadingExisting) {
    return (
      <div className="flex items-center justify-center py-24">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <IconButton onClick={() => navigate('/cuestionarios')} size="small" sx={{ border: '1px solid #e2e8f0' }}>
            <ArrowBack fontSize="small" />
          </IconButton>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {isEdit ? `Editando: "${titulo || '...'}"` : 'Nuevo cuestionario'}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">{preguntas.length} pregunta{preguntas.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
          onClick={handleSave}
          disabled={saving}
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>

      {/* Quiz metadata */}
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} color="#1e293b" sx={{ mb: 2 }}>
            Información del cuestionario
          </Typography>
          <div className="space-y-3">
            <TextField
              label="Título"
              fullWidth
              size="small"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
            <TextField
              label="Descripción (opcional)"
              fullWidth
              size="small"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              multiline
              minRows={2}
            />
            {materias.length > 0 && (
              <TextField
                select
                label="Materia"
                fullWidth
                size="small"
                value={profesorMateriaId}
                onChange={(e) => setProfesorMateriaId(e.target.value)}
                required
                SelectProps={{ native: true }}
              >
                <option value="">-- Selecciona una materia --</option>
                {materias.map((m) => (
                  <option key={m.id_profesor_materia} value={m.id_profesor_materia}>
                    {m.materia?.nombre || `Materia ${m.id_profesor_materia}`}
                  </option>
                ))}
              </TextField>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="flex items-center justify-between mb-3">
        <Typography variant="subtitle1" fontWeight={700} color="#1e293b">Preguntas</Typography>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={addPregunta}
          size="small"
          sx={{ borderRadius: '8px', textTransform: 'none' }}
        >
          Agregar pregunta
        </Button>
      </div>

      <div className="space-y-4">
        {preguntas.map((p, idx) => (
          <PreguntaEditor
            key={idx}
            pregunta={p}
            index={idx}
            onChange={(updated) => updatePregunta(idx, updated)}
            onDelete={() => removePregunta(idx)}
          />
        ))}
      </div>

      {preguntas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-sm mb-2">Sin preguntas aún</p>
          <Button size="small" startIcon={<Add />} onClick={addPregunta} sx={{ textTransform: 'none' }}>
            Agregar primera pregunta
          </Button>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
          onClick={handleSave}
          disabled={saving}
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
        >
          {saving ? 'Guardando...' : 'Guardar cuestionario'}
        </Button>
      </div>
    </div>
  );
}

export default CuestionarioEditorPage;
