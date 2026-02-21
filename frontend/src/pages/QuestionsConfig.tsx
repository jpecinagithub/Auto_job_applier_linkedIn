import { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { configApi } from '../services/api';
import type { QuestionsConfig } from '../types/config';
import './ConfigForms.css';

const defaultQuestions: QuestionsConfig = {
  years_of_experience: '5',
  linkedIn: '',
  website: '',
  linkedin_summary: '',
  cover_letter: '',
  recent_employer: '',
  linkedin_headline: '',
  require_visa: 'No',
  default_resume_path: 'all resumes/default/resume.pdf',
  overwrite_previous_answers: false,
  follow_previous_answers: true,
  pause_before_submit: false,
  pause_at_failed_question: false,
};

export function QuestionsConfigPage() {
  const [config, setConfig] = useState<QuestionsConfig>(defaultQuestions);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await configApi.getQuestions();
      setConfig({ ...defaultQuestions, ...data });
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await configApi.saveQuestions(config);
      setMessage({ type: 'success', text: 'Configuración de preguntas guardada correctamente' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(defaultQuestions);
    setMessage(null);
  };

  if (loading) {
    return <div className="loading">Cargando configuración...</div>;
  }

  return (
    <div className="config-page">
      <div className="page-header">
        <h2>Configuración de Preguntas</h2>
        <p>Respuestas automáticas para preguntas frecuentes en postulaciones</p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form-section">
        <h3>Información del Perfil</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Años de experiencia</label>
            <input
              type="text"
              value={config.years_of_experience}
              onChange={(e) => setConfig(prev => ({ ...prev, years_of_experience: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>URL de LinkedIn</label>
            <input
              type="text"
              value={config.linkedIn}
              onChange={(e) => setConfig(prev => ({ ...prev, linkedIn: e.target.value }))}
              placeholder="https://linkedin.com/in/tu-perfil"
            />
          </div>

          <div className="form-group">
            <label>Sitio web / Portfolio</label>
            <input
              type="text"
              value={config.website}
              onChange={(e) => setConfig(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://tuportfolio.com"
            />
          </div>

          <div className="form-group">
            <label>Último empleador</label>
            <input
              type="text"
              value={config.recent_employer}
              onChange={(e) => setConfig(prev => ({ ...prev, recent_employer: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Headline de LinkedIn</label>
            <input
              type="text"
              value={config.linkedin_headline}
              onChange={(e) => setConfig(prev => ({ ...prev, linkedin_headline: e.target.value }))}
              placeholder="Software Engineer | Full Stack Developer"
            />
          </div>

          <div className="form-group">
            <label>Requiere visa</label>
            <select
              value={config.require_visa}
              onChange={(e) => setConfig(prev => ({ ...prev, require_visa: e.target.value }))}
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Cartas y Resúmenes</h3>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Resumen de LinkedIn</label>
            <textarea
              rows={4}
              value={config.linkedin_summary}
              onChange={(e) => setConfig(prev => ({ ...prev, linkedin_summary: e.target.value }))}
              placeholder="Breve descripción de ti mismo..."
            />
          </div>

          <div className="form-group full-width">
            <label>Carta de presentación</label>
            <textarea
              rows={6}
              value={config.cover_letter}
              onChange={(e) => setConfig(prev => ({ ...prev, cover_letter: e.target.value }))}
              placeholder="Carta de presentación por defecto..."
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Resume</h3>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Ruta del resume por defecto</label>
            <input
              type="text"
              value={config.default_resume_path}
              onChange={(e) => setConfig(prev => ({ ...prev, default_resume_path: e.target.value }))}
            />
            <span className="hint">Ruta relativa desde la raíz del proyecto</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Comportamiento del Bot</h3>
        <div className="form-grid">
          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.overwrite_previous_answers}
              onChange={(e) => setConfig(prev => ({ ...prev, overwrite_previous_answers: e.target.checked }))}
            />
            Sobrescribir respuestas anteriores
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.follow_previous_answers}
              onChange={(e) => setConfig(prev => ({ ...prev, follow_previous_answers: e.target.checked }))}
            />
            Recordar respuestas anteriores
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.pause_before_submit}
              onChange={(e) => setConfig(prev => ({ ...prev, pause_before_submit: e.target.checked }))}
            />
            Pausar antes de enviar
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.pause_at_failed_question}
              onChange={(e) => setConfig(prev => ({ ...prev, pause_at_failed_question: e.target.checked }))}
            />
            Pausar en pregunta fallida
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-secondary" onClick={handleReset}>
          <RotateCcw size={16} />
          Restablecer
        </button>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={16} />
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
