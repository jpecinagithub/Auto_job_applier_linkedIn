import { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { configApi } from '../services/api';
import type { PersonalsConfig } from '../types/config';
import './ConfigForms.css';

const defaultPersonals: PersonalsConfig = {
  first_name: '',
  middle_name: '',
  last_name: '',
  phone_number: '',
  phone_country_code: '+34',
  current_city: '',
  street: '',
  state: '',
  zipcode: '',
  country: '',
  ethnicity: 'Decline',
  gender: 'Decline',
  disability_status: 'Decline',
  veteran_status: 'Decline',
};

const ethnicityOptions = ['', 'Decline', 'Hispanic/Latino', 'American Indian or Alaska Native', 'Asian', 'Black or African American', 'Native Hawaiian or Other Pacific Islander', 'White', 'Other'];
const genderOptions = ['', 'Male', 'Female', 'Other', 'Decline'];
const yesNoDeclineOptions = ['', 'Yes', 'No', 'Decline'];

export function PersonalsConfigPage() {
  const [config, setConfig] = useState<PersonalsConfig>(defaultPersonals);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await configApi.getPersonals();
      setConfig({ ...defaultPersonals, ...data });
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
      await configApi.savePersonals(config);
      setMessage({ type: 'success', text: 'Datos personales guardados correctamente' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar los datos' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(defaultPersonals);
    setMessage(null);
  };

  if (loading) {
    return <div className="loading">Cargando configuración...</div>;
  }

  return (
    <div className="config-page">
      <div className="page-header">
        <h2>Datos Personales</h2>
        <p>Información personal que se usará en las postulaciones</p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form-section">
        <h3>Información de Contacto</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              value={config.first_name}
              onChange={(e) => setConfig(prev => ({ ...prev, first_name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Segundo nombre</label>
            <input
              type="text"
              value={config.middle_name}
              onChange={(e) => setConfig(prev => ({ ...prev, middle_name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Apellido</label>
            <input
              type="text"
              value={config.last_name}
              onChange={(e) => setConfig(prev => ({ ...prev, last_name: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              value={config.phone_number}
              onChange={(e) => setConfig(prev => ({ ...prev, phone_number: e.target.value }))}
              placeholder="Sin prefijo"
            />
          </div>

          <div className="form-group">
            <label>Código de país</label>
            <input
              type="text"
              value={config.phone_country_code}
              onChange={(e) => setConfig(prev => ({ ...prev, phone_country_code: e.target.value }))}
              placeholder="+34"
            />
          </div>

          <div className="form-group">
            <label>Ciudad actual</label>
            <input
              type="text"
              value={config.current_city}
              onChange={(e) => setConfig(prev => ({ ...prev, current_city: e.target.value }))}
            />
            <span className="hint">Se usará la ubicación del empleo si se deja vacío</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Dirección</h3>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Calle</label>
            <input
              type="text"
              value={config.street}
              onChange={(e) => setConfig(prev => ({ ...prev, street: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Estado/Provincia</label>
            <input
              type="text"
              value={config.state}
              onChange={(e) => setConfig(prev => ({ ...prev, state: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Código postal</label>
            <input
              type="text"
              value={config.zipcode}
              onChange={(e) => setConfig(prev => ({ ...prev, zipcode: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>País</label>
            <input
              type="text"
              value={config.country}
              onChange={(e) => setConfig(prev => ({ ...prev, country: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Igualdad de Oportunidades (EEOC)</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Etnia</label>
            <select
              value={config.ethnicity}
              onChange={(e) => setConfig(prev => ({ ...prev, ethnicity: e.target.value }))}
            >
              {ethnicityOptions.map(opt => <option key={opt} value={opt}>{opt || 'No responder'}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Género</label>
            <select
              value={config.gender}
              onChange={(e) => setConfig(prev => ({ ...prev, gender: e.target.value }))}
            >
              {genderOptions.map(opt => <option key={opt} value={opt}>{opt || 'No responder'}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Discapacidad</label>
            <select
              value={config.disability_status}
              onChange={(e) => setConfig(prev => ({ ...prev, disability_status: e.target.value }))}
            >
              {yesNoDeclineOptions.map(opt => <option key={opt} value={opt}>{opt || 'No responder'}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Estado de veterano</label>
            <select
              value={config.veteran_status}
              onChange={(e) => setConfig(prev => ({ ...prev, veteran_status: e.target.value }))}
            >
              {yesNoDeclineOptions.map(opt => <option key={opt} value={opt}>{opt || 'No responder'}</option>)}
            </select>
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
