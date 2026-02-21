import { useState, useEffect } from 'react';
import { ExternalLink, Search, Filter } from 'lucide-react';
import { jobsApi } from '../services/api';
import type { JobHistory } from '../types/config';
import './ConfigForms.css';

export function HistoryPage() {
  const [jobs, setJobs] = useState<JobHistory[]>([]);
  const [failedJobs, setFailedJobs] = useState<JobHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applied' | 'failed'>('applied');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [applied, failed] = await Promise.all([
        jobsApi.getHistory(),
        jobsApi.getFailed(),
      ]);
      setJobs(applied);
      setFailedJobs(failed);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentJobs = activeTab === 'applied' ? jobs : failedJobs;
  
  const filteredJobs = currentJobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.Company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.Job_ID?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = !filterCompany || 
      job.Company?.toLowerCase().includes(filterCompany.toLowerCase());
    
    return matchesSearch && matchesCompany;
  });

  const companies = [...new Set(currentJobs.map(j => j.Company).filter(Boolean))];

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr || dateStr === 'Pending') return 'Pendiente';
    return dateStr;
  };

  if (loading) {
    return <div className="loading">Cargando historial...</div>;
  }

  return (
    <div className="config-page">
      <div className="page-header">
        <h2>Historial de Postulaciones</h2>
        <p>Ver todas las aplicaciones enviadas</p>
      </div>

      <div className="config-tabs">
        <button
          className={`config-tab ${activeTab === 'applied' ? 'active' : ''}`}
          onClick={() => setActiveTab('applied')}
        >
          Aplicadas ({jobs.length})
        </button>
        <button
          className={`config-tab ${activeTab === 'failed' ? 'active' : ''}`}
          onClick={() => setActiveTab('failed')}
        >
          Fallidas ({failedJobs.length})
        </button>
      </div>

      <div className="history-filters">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search 
            size={16} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)'
            }} 
          />
          <input
            type="text"
            placeholder="Buscar por título, empresa o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>
        <div style={{ position: 'relative', minWidth: '200px' }}>
          <Filter 
            size={16} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)'
            }} 
          />
          <select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
            style={{ paddingLeft: '36px', width: '100%' }}
          >
            <option value="">Todas las empresas</option>
            {companies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="empty-state">
          <Search size={48} />
          <h3>No se encontraron empleos</h3>
          <p>
            {currentJobs.length === 0 
              ? 'Aún no hay postulaciones en el historial'
              : 'No hay resultados que coincidan con los filtros'
            }
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Empresa</th>
                <th>Ubicación</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.Job_ID}>
                  <td>{job.Job_ID}</td>
                  <td>{job.Title}</td>
                  <td>{job.Company}</td>
                  <td>{job.Work_Location || '-'}</td>
                  <td>{formatDate(job.Date_Applied)}</td>
                  <td>
                    <span className={`badge ${job.Date_Applied && job.Date_Applied !== 'Pending' ? 'badge-success' : 'badge-warning'}`}>
                      {job.Date_Applied && job.Date_Applied !== 'Pending' ? 'Aplicado' : 'Pendiente'}
                    </span>
                  </td>
                  <td>
                    <div className="history-actions">
                      {job.Job_Link && job.Job_Link !== 'Unknown' && (
                        <a
                          href={job.Job_Link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          title="Ver en LinkedIn"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {job.External_Job_link && job.External_Job_link !== 'Easy Applied' && job.External_Job_link !== 'Skipped' && (
                        <a
                          href={job.External_Job_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary"
                          title="Aplicación externa"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
