import { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { configApi } from '../services/api';
import type { SearchConfig } from '../types/config';
import './ConfigForms.css';

const defaultSearch: SearchConfig = {
  search_terms: [],
  search_location: '',
  switch_number: 30,
  randomize_search_order: false,
  sort_by: '',
  date_posted: 'Past 24 hours',
  salary: '',
  easy_apply_only: true,
  experience_level: [],
  job_type: [],
  on_site: ['On-site', 'Hybrid'],
  companies: [],
  location: [],
  industry: [],
  job_function: [],
  job_titles: [],
  benefits: [],
  commitments: [],
  under_10_applicants: true,
  in_your_network: false,
  fair_chance_employer: false,
  english_only_jobs: true,
  pause_after_filters: false,
  about_company_bad_words: [],
  about_company_good_words: [],
  bad_words: [],
  exclude_locations: ['UK', 'United Kingdom', 'England', 'Scotland', 'Wales', 'London', 'Manchester', 'Birmingham'],
  security_clearance: false,
  did_masters: true,
  current_experience: 5,
};

const experienceLevels = ['Internship', 'Entry level', 'Associate', 'Mid-Senior level', 'Director', 'Executive'];
const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Volunteer', 'Internship', 'Other'];
const workTypes = ['On-site', 'Remote', 'Hybrid'];
const dateOptions = ['Any time', 'Past month', 'Past week', 'Past 24 hours'];
const sortOptions = ['Most recent', 'Most relevant'];
const salaryOptions = ['$40,000+', '$60,000+', '$80,000+', '$100,000+', '$120,000+', '$140,000+', '$160,000+', '$180,000+', '$200,000+'];

export function SearchConfigPage() {
  const [config, setConfig] = useState<SearchConfig>(defaultSearch);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [tagInput, setTagInput] = useState({ search_terms: '', companies: '', bad_words: '', about_company_bad_words: '', about_company_good_words: '', exclude_locations: '' });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const data = await configApi.getSearch();
      console.log('Loaded config raw:', JSON.stringify(data));
      setConfig(data as SearchConfig);
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    console.log('Saving config:', JSON.stringify(config));
    setSaving(true);
    setMessage(null);
    try {
      await configApi.saveSearch(config);
      setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
      // Reload config from server to ensure we have the latest values
      await loadConfig();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(defaultSearch);
    setMessage(null);
  };

  const handleArrayChange = (field: keyof SearchConfig, value: string[]) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleTagInput = (field: keyof SearchConfig, key: keyof typeof tagInput) => {
    let value = tagInput[key];
    console.log('handleTagInput called with:', value);
    
    // Clean the value - remove quotes if present
    value = value.replace(/^["']|["']$/g, '').trim();
    
    if (value) {
      const currentArray = config[field] as string[];
      console.log('currentArray before:', currentArray);
      if (!currentArray.includes(value)) {
        const newArray = [...currentArray, value];
        console.log('newArray after:', newArray);
        handleArrayChange(field, newArray);
      }
      setTagInput(prev => ({ ...prev, [key]: '' }));
    }
  };

  const removeTag = (field: keyof SearchConfig, index: number) => {
    const currentArray = config[field] as string[];
    handleArrayChange(field, currentArray.filter((_, i) => i !== index));
  };

  const toggleArrayOption = (field: keyof SearchConfig, option: string) => {
    const currentArray = config[field] as string[];
    if (currentArray.includes(option)) {
      handleArrayChange(field, currentArray.filter(o => o !== option));
    } else {
      handleArrayChange(field, [...currentArray, option]);
    }
  };

  if (loading) {
    return <div className="loading">Cargando configuración...</div>;
  }

  return (
    <div className="config-page">
      <div className="page-header">
        <h2>Configuración de Búsqueda</h2>
        <p>Define los parámetros de búsqueda de empleos en LinkedIn</p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="form-section">
        <h3>Términos de Búsqueda</h3>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Términos de búsqueda</label>
            <div className="tag-input">
              {config.search_terms.map((term, index) => (
                <span key={index} className="tag">
                  {term}
                  <span className="tag-remove" onClick={() => removeTag('search_terms', index)}>×</span>
                </span>
              ))}
              <input
                type="text"
                placeholder="Escribe y presiona Enter..."
                value={tagInput.search_terms}
                onChange={(e) => setTagInput(prev => ({ ...prev, search_terms: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Enter pressed, calling handleTagInput');
                    handleTagInput('search_terms', 'search_terms');
                  }
                }}
              />
            </div>
            <span className="hint">Ej: "Software Engineer", "Data Analyst"</span>
          </div>

          <div className="form-group">
            <label>Ubicación</label>
            <input
              type="text"
              value={config.search_location}
              onChange={(e) => setConfig(prev => ({ ...prev, search_location: e.target.value }))}
              placeholder="Ciudad, estado o código postal"
            />
          </div>

          <div className="form-group">
            <label>Postulaciones por búsqueda</label>
            <input
              type="number"
              min="1"
              value={config.switch_number}
              onChange={(e) => setConfig(prev => ({ ...prev, switch_number: parseInt(e.target.value) || 30 }))}
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.randomize_search_order}
                onChange={(e) => setConfig(prev => ({ ...prev, randomize_search_order: e.target.checked }))}
              />
              Orden aleatorio de búsqueda
            </label>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Filtros de Búsqueda</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Ordenar por</label>
            <select
              value={config.sort_by}
              onChange={(e) => setConfig(prev => ({ ...prev, sort_by: e.target.value }))}
            >
              <option value="">No seleccionar</option>
              {sortOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Fecha de publicación</label>
            <select
              value={config.date_posted}
              onChange={(e) => setConfig(prev => ({ ...prev, date_posted: e.target.value }))}
            >
              <option value="">No seleccionar</option>
              {dateOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Salario mínimo</label>
            <select
              value={config.salary}
              onChange={(e) => setConfig(prev => ({ ...prev, salary: e.target.value }))}
            >
              <option value="">No seleccionar</option>
              {salaryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Experiencia</label>
            <div className="toggle-group">
              {experienceLevels.map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`toggle-option ${config.experience_level.includes(opt) ? 'active' : ''}`}
                  onClick={() => toggleArrayOption('experience_level', opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Tipo de trabajo</label>
            <div className="toggle-group">
              {jobTypes.map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`toggle-option ${config.job_type.includes(opt) ? 'active' : ''}`}
                  onClick={() => toggleArrayOption('job_type', opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Modalidad</label>
            <div className="toggle-group">
              {workTypes.map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`toggle-option ${config.on_site.includes(opt) ? 'active' : ''}`}
                  onClick={() => toggleArrayOption('on_site', opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.easy_apply_only}
              onChange={(e) => setConfig(prev => ({ ...prev, easy_apply_only: e.target.checked }))}
            />
            Solo Easy Apply
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.under_10_applicants}
              onChange={(e) => setConfig(prev => ({ ...prev, under_10_applicants: e.target.checked }))}
            />
            Menos de 10 solicitantes
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.in_your_network}
              onChange={(e) => setConfig(prev => ({ ...prev, in_your_network: e.target.checked }))}
            />
            En tu red
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.fair_chance_employer}
              onChange={(e) => setConfig(prev => ({ ...prev, fair_chance_employer: e.target.checked }))}
            />
            Empleador de Oportunidad Justa
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.english_only_jobs}
              onChange={(e) => setConfig(prev => ({ ...prev, english_only_jobs: e.target.checked }))}
            />
            Solo empleos en inglés
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.pause_after_filters}
              onChange={(e) => setConfig(prev => ({ ...prev, pause_after_filters: e.target.checked }))}
            />
            Pausar después de aplicar filtros
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Palabras Clave y Excepciones</h3>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Empresas a evitar</label>
            <div className="tag-input">
              {config.companies.map((term, index) => (
                <span key={index} className="tag">
                  {term}
                  <span className="tag-remove" onClick={() => removeTag('companies', index)}>×</span>
                </span>
              ))}
              <input
                type="text"
                placeholder="Escribe y presiona Enter..."
                value={tagInput.companies}
                onChange={(e) => setTagInput(prev => ({ ...prev, companies: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagInput('companies', 'companies'))}
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Palabras negativas en descripción</label>
            <div className="tag-input">
              {config.bad_words.map((term, index) => (
                <span key={index} className="tag">
                  {term}
                  <span className="tag-remove" onClick={() => removeTag('bad_words', index)}>×</span>
                </span>
              ))}
              <input
                type="text"
                placeholder="Escribe y presiona Enter..."
                value={tagInput.bad_words}
                onChange={(e) => setTagInput(prev => ({ ...prev, bad_words: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagInput('bad_words', 'bad_words'))}
              />
            </div>
            <span className="hint">El bot omitirá empleos que contengan estas palabras</span>
          </div>

          <div className="form-group full-width">
            <label>Empresas a evitar (Acerca de)</label>
            <div className="tag-input">
              {config.about_company_bad_words.map((term, index) => (
                <span key={index} className="tag">
                  {term}
                  <span className="tag-remove" onClick={() => removeTag('about_company_bad_words', index)}>×</span>
                </span>
              ))}
              <input
                type="text"
                placeholder="Escribe y presiona Enter..."
                value={tagInput.about_company_bad_words}
                onChange={(e) => setTagInput(prev => ({ ...prev, about_company_bad_words: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagInput('about_company_bad_words', 'about_company_bad_words'))}
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Excepciones (Palabras positivas en "Acerca de")</label>
            <div className="tag-input">
              {config.about_company_good_words.map((term, index) => (
                <span key={index} className="tag">
                  {term}
                  <span className="tag-remove" onClick={() => removeTag('about_company_good_words', index)}>×</span>
                </span>
              ))}
              <input
                type="text"
                placeholder="Escribe y presiona Enter..."
                value={tagInput.about_company_good_words}
                onChange={(e) => setTagInput(prev => ({ ...prev, about_company_good_words: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagInput('about_company_good_words', 'about_company_good_words'))}
              />
            </div>
            <span className="hint">Si la empresa tiene estas palabras, se saltará la verificación de palabras negativas</span>
          </div>

          <div className="form-group full-width">
            <label>Ubicaciones a excluir (omitir empleos en estas ubicaciones)</label>
            <div className="tag-input">
              {config.exclude_locations.map((term, index) => (
                <span key={index} className="tag">
                  {term}
                  <span className="tag-remove" onClick={() => removeTag('exclude_locations', index)}>×</span>
                </span>
              ))}
              <input
                type="text"
                placeholder="Escribe y presiona Enter..."
                value={tagInput.exclude_locations}
                onChange={(e) => setTagInput(prev => ({ ...prev, exclude_locations: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagInput('exclude_locations', 'exclude_locations'))}
              />
            </div>
            <span className="hint">El bot omitirá empleos en estas ubicaciones (ej: UK, London, United Kingdom)</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Configuración de Experiencia</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Años de experiencia actual</label>
            <input
              type="number"
              min="-1"
              value={config.current_experience}
              onChange={(e) => setConfig(prev => ({ ...prev, current_experience: parseInt(e.target.value) || -1 }))}
            />
            <span className="hint">Usa -1 para aplicar a todos sin importar experiencia requerida</span>
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.did_masters}
              onChange={(e) => setConfig(prev => ({ ...prev, did_masters: e.target.checked }))}
            />
            Tengo maestría
          </div>

          <div className="form-group checkbox-label">
            <input
              type="checkbox"
              checked={config.security_clearance}
              onChange={(e) => setConfig(prev => ({ ...prev, security_clearance: e.target.checked }))}
            />
            Tengo autorización de seguridad
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
