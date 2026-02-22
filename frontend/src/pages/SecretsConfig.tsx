import { useState, useEffect } from 'react';
import { Save, RotateCcw, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { configApi } from '../services/api';
import type { SecretsConfig } from '../types/config';
import './ConfigForms.css';

const defaultSecrets: SecretsConfig = {
  username: '',
  password: '',
  use_AI: false,
  ai_provider: 'gemini',
  llm_api_url: 'https://generativelanguage.googleapis.com/v1beta/',
  llm_api_key: '',
  llm_model: 'gemini-2.0-pro',
  stream_output: false,
};

const aiProviders = ['openai', 'deepseek', 'gemini'];

const geminiModels = [
  { value: 'gemini-2.0-pro', label: 'Gemini 2.0 Pro (Recommended)' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.5-flash-8b', label: 'Gemini 1.5 Flash 8B' },
  { value: 'custom', label: 'Otro (especificar)' },
];

export function SecretsConfigPage() {
  const [config, setConfig] = useState<SecretsConfig>(defaultSecrets);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await configApi.getSecrets();
      setConfig({ ...defaultSecrets, ...data });
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
      await configApi.saveSecrets(config);
      setMessage({ type: 'success', text: 'Credenciales guardadas correctamente' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar las credenciales' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(defaultSecrets);
    setMessage(null);
  };

  if (loading) {
    return <div className="loading">Cargando configuración...</div>;
  }

  return (
    <div className="config-page">
      <div className="page-header">
        <h2>Credenciales</h2>
        <p>Configura el acceso a LinkedIn y servicios de IA</p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="credentials-warning">
        <AlertTriangle className="warning-icon" size={20} />
        <div>
          <h4>Información sensible</h4>
          <p>Estas credenciales se almacenan localmente en tu equipo. No se transmiten a ningún servidor externo.</p>
        </div>
      </div>

      <div className="form-section">
        <h3>LinkedIn</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Usuario / Email</label>
            <input
              type="text"
              value={config.username}
              onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
              placeholder="tu@email.com"
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={config.password}
                onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <span className="hint">Si se deja en blanco, usará el perfil guardado del navegador</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Inteligencia Artificial (Opcional)</h3>
        <div className="form-grid">
          <div className="form-group checkbox-label" style={{ gridColumn: '1 / -1' }}>
            <input
              type="checkbox"
              checked={config.use_AI}
              onChange={(e) => setConfig(prev => ({ ...prev, use_AI: e.target.checked }))}
            />
            Habilitar IA para selección de CV y respuestas automáticas
          </div>

          {config.use_AI && (
            <>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Proveedor de IA</label>
                <select
                  value={config.ai_provider}
                  onChange={(e) => setConfig(prev => ({ ...prev, ai_provider: e.target.value }))}
                >
                  {aiProviders.map(provider => (
                    <option key={provider} value={provider}>
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-section" style={{ gridColumn: '1 / -1', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px', marginTop: '8px' }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Configuración de {config.ai_provider === 'gemini' ? 'Gemini' : config.ai_provider.toUpperCase()}
                </h4>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>API Key</label>
                    <input
                      type="password"
                      value={config.llm_api_key}
                      onChange={(e) => setConfig(prev => ({ ...prev, llm_api_key: e.target.value }))}
                      placeholder={config.ai_provider === 'gemini' ? 'AIza...' : 'sk-...'}
                    />
                  </div>

                  {config.ai_provider === 'gemini' && (
                    <div className="form-group">
                      <label>Modelo</label>
                      <select
                        value={geminiModels.some(m => m.value === config.llm_model) ? config.llm_model : 'custom'}
                        onChange={(e) => setConfig(prev => ({ ...prev, llm_model: e.target.value }))}
                      >
                        {geminiModels.map(model => (
                          <option key={model.value} value={model.value}>
                            {model.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {config.ai_provider !== 'gemini' && (
                    <>
                      <div className="form-group">
                        <label>Modelo</label>
                        <input
                          type="text"
                          value={config.llm_model}
                          onChange={(e) => setConfig(prev => ({ ...prev, llm_model: e.target.value }))}
                          placeholder="gpt-3.5-turbo"
                        />
                      </div>

                      <div className="form-group">
                        <label>URL de API</label>
                        <input
                          type="text"
                          value={config.llm_api_url}
                          onChange={(e) => setConfig(prev => ({ ...prev, llm_api_url: e.target.value }))}
                          placeholder="https://api.openai.com/v1/"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {config.ai_provider === 'gemini' && (
                <div className="form-group checkbox-label" style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                  <input
                    type="checkbox"
                    checked={config.stream_output}
                    onChange={(e) => setConfig(prev => ({ ...prev, stream_output: e.target.checked }))}
                  />
                  Mostrar salida en streaming
                </div>
              )}
            </>
          )}
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
