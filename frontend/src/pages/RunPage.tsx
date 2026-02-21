import { useState, useEffect, useRef } from 'react';
import { Play, Square, RefreshCw, Activity } from 'lucide-react';
import { botApi, configApi } from '../services/api';
import type { BotStatus, SearchConfig } from '../types/config';
import './ConfigForms.css';

export function RunPage() {
  const [status, setStatus] = useState<BotStatus>({
    running: false,
    total_runs: 0,
    easy_applied_count: 0,
    external_jobs_count: 0,
    failed_count: 0,
    skip_count: 0,
    current_search_term: '',
    current_job_title: '',
    current_company: '',
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchConfig, setSearchConfig] = useState<SearchConfig | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
    
    const interval = setInterval(() => {
      if (status.running) {
        fetchStatus();
        fetchLogs();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [status.running]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const loadInitialData = async () => {
    try {
      const data = await configApi.getSearch();
      setSearchConfig(data);
    } catch (error) {
      console.error('Failed to load search config:', error);
    }
    await fetchStatus();
  };

  const fetchStatus = async () => {
    try {
      const data = await botApi.status();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await botApi.logs();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      await botApi.start(searchConfig || undefined);
      setStatus(prev => ({ ...prev, running: true }));
      fetchLogs();
    } catch (error) {
      console.error('Failed to start bot:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await botApi.stop();
      setStatus(prev => ({ ...prev, running: false }));
    } catch (error) {
      console.error('Failed to stop bot:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="config-page">
      <div className="page-header">
        <h2>Ejecutar Bot</h2>
        <p>Inicia y controla el bot de postulación</p>
      </div>

      <div className={`status-bar ${status.running ? 'running' : 'stopped'}`}>
        <div className="status-icon">
          <Activity size={20} />
        </div>
        <div className="status-info">
          <h3>{status.running ? 'Bot en ejecución' : 'Bot detenido'}</h3>
          <p>
            {status.running 
              ? `Buscando: ${status.current_search_term || 'Iniciando...'}`
              : 'Listo para iniciar'
            }
          </p>
        </div>
        <div className="status-actions">
          {status.running ? (
            <button 
              className="btn btn-danger" 
              onClick={handleStop}
              disabled={loading}
            >
              <Square size={16} />
              Detener
            </button>
          ) : (
            <button 
              className="btn btn-success" 
              onClick={handleStart}
              disabled={loading}
            >
              <Play size={16} />
              Iniciar
            </button>
          )}
        </div>
      </div>

      {status.running && (
        <div className="job-status">
          <span className="dot"></span>
          <span>
            {status.current_job_title 
              ? `Procesando: ${status.current_job_title} en ${status.current_company}`
              : 'Obteniendo siguiente empleo...'
            }
          </span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{status.total_runs}</div>
          <div className="stat-label">Ciclos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{status.easy_applied_count}</div>
          <div className="stat-label">Easy Apply</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{status.external_jobs_count}</div>
          <div className="stat-label">Externos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{status.failed_count}</div>
          <div className="stat-label">Fallidos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{status.skip_count}</div>
          <div className="stat-label">Omitidos</div>
        </div>
      </div>

      <div className="form-section">
        <h3>Logs en tiempo real</h3>
        <div className="log-window">
          <div className="log-header">
            <h4>Consola de logs</h4>
            <button onClick={clearLogs}>
              <RefreshCw size={12} />
              Limpiar
            </button>
          </div>
          <div className="log-content">
            {logs.length === 0 ? (
              <div className="log-line">No hay logs disponibles...</div>
            ) : (
              logs.map((log, index) => {
                let className = 'log-line';
                if (log.includes('ERROR') || log.includes('Error')) className += ' error';
                else if (log.includes('SUCCESS') || log.includes('Success') || log.includes('✓')) className += ' success';
                else if (log.includes('WARNING') || log.includes('Warning')) className += ' warning';
                else if (log.includes('INFO') || log.includes('>>>') || log.includes('---')) className += ' info';
                else if (log.includes('Skipping') || log.includes('Skip')) className += ' highlight';
                
                return (
                  <div key={index} className={className}>
                    {log}
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
