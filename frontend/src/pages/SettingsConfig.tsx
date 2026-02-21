import { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { configApi } from '../services/api';
import type { SettingsConfig } from '../types/config';
import './ConfigForms.css';

const defaultSettings: SettingsConfig = {
  close_tabs: false,
  follow_companies: false,
  run_non_stop: false,
  alternate_sortby: true,
  cycle_date_posted: true,
  stop_date_cycle_at_24hr: true,
  generated_resume_path: 'all resumes/',
  file_name: 'all excels/all_applied_applications_history.csv',
  failed_file_name: 'all excels/all_failed_applications_history.csv',
  logs_folder_path: 'logs/',
  click_gap: 1,
  run_in_background: false,
  disable_extensions: true,
  safe_mode: true,
  smooth_scroll: false,
  keep_screen_awake: true,
  stealth_mode: false,
  showAiErrorAlerts: false,
};

export function SettingsConfigPage() {
  const [config, setConfig] = useState<SettingsConfig>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await configApi.getSettings();
      setConfig({ ...defaultSettings, ...data });
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
      await configApi.saveSettings(config);
      setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(defaultSettings);
    setMessage(null);
  };

  if (loading) {
    return <div className="loading">Cargando configuración...</div>;
  }

  return (
    <div className="config-page">
      <div className="page-header">
        <h2>Configuración del Bot</h2>
        <p>Ajustes generales de comportamiento del bot</p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form-section">
        <h3>LinkedIn</h3>
        <div className="form-grid">
          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.close_tabs}
              onChange={(e) => setConfig(prev => ({ ...prev, close_tabs: e.target.checked }))}
            />
            Cerrar pestañas externas automáticamente
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.follow_companies}
              onChange={(e) => setConfig(prev => ({ ...prev, follow_companies: e.target.checked }))}
            />
            Seguir empresas después de aplicar
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Ciclo de Ejecución</h3>
        <div className="form-grid">
          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.run_non_stop}
              onChange={(e) => setConfig(prev => ({ ...prev, run_non_stop: e.target.checked }))}
            />
            Ejecutar continuamente
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.alternate_sortby}
              onChange={(e) => setConfig(prev => ({ ...prev, alternate_sortby: e.target.checked }))}
            />
            Alternar orden de resultados
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.cycle_date_posted}
              onChange={(e) => setConfig(prev => ({ ...prev, cycle_date_posted: e.target.checked }))}
            />
            Ciclar fecha de publicación
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.stop_date_cycle_at_24hr}
              onChange={(e) => setConfig(prev => ({ ...prev, stop_date_cycle_at_24hr: e.target.checked }))}
            />
            Detener ciclo en últimas 24 horas
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Rendimiento</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Intervalo entre clics (segundos)</label>
            <input
              type="number"
              min="0"
              value={config.click_gap}
              onChange={(e) => setConfig(prev => ({ ...prev, click_gap: parseInt(e.target.value) || 1 }))}
            />
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.run_in_background}
              onChange={(e) => setConfig(prev => ({ ...prev, run_in_background: e.target.checked }))}
            />
            Ejecutar en segundo plano
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.disable_extensions}
              onChange={(e) => setConfig(prev => ({ ...prev, disable_extensions: e.target.checked }))}
            />
            Deshabilitar extensiones
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.safe_mode}
              onChange={(e) => setConfig(prev => ({ ...prev, safe_mode: e.target.checked }))}
            />
            Modo seguro
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.smooth_scroll}
              onChange={(e) => setConfig(prev => ({ ...prev, smooth_scroll: e.target.checked }))}
            />
            Desplazamiento suave
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.keep_screen_awake}
              onChange={(e) => setConfig(prev => ({ ...prev, keep_screen_awake: e.target.checked }))}
            />
            Mantener pantalla encendida
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.stealth_mode}
              onChange={(e) => setConfig(prev => ({ ...prev, stealth_mode: e.target.checked }))}
            />
            Modo sigiloso (evitar detección)
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.showAiErrorAlerts}
              onChange={(e) => setConfig(prev => ({ ...prev, showAiErrorAlerts: e.target.checked }))}
            />
            Mostrar alertas de error de IA
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Archivos</h3>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Ruta de resumes generados</label>
            <input
              type="text"
              value={config.generated_resume_path}
              onChange={(e) => setConfig(prev => ({ ...prev, generated_resume_path: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Archivo de historial</label>
            <input
              type="text"
              value={config.file_name}
              onChange={(e) => setConfig(prev => ({ ...prev, file_name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Archivo de fallos</label>
            <input
              type="text"
              value={config.failed_file_name}
              onChange={(e) => setConfig(prev => ({ ...prev, failed_file_name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Carpeta de logs</label>
            <input
              type="text"
              value={config.logs_folder_path}
              onChange={(e) => setConfig(prev => ({ ...prev, logs_folder_path: e.target.value }))}
            />
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
