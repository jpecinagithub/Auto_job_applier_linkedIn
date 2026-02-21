import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { SearchConfigPage } from './pages/SearchConfig';
import { PersonalsConfigPage } from './pages/PersonalsConfig';
import { QuestionsConfigPage } from './pages/QuestionsConfig';
import { SecretsConfigPage } from './pages/SecretsConfig';
import { SettingsConfigPage } from './pages/SettingsConfig';
import { RunPage } from './pages/RunPage';
import { HistoryPage } from './pages/HistoryPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/search" replace />} />
          <Route path="search" element={<SearchConfigPage />} />
          <Route path="personals" element={<PersonalsConfigPage />} />
          <Route path="questions" element={<QuestionsConfigPage />} />
          <Route path="secrets" element={<SecretsConfigPage />} />
          <Route path="settings" element={<SettingsConfigPage />} />
          <Route path="run" element={<RunPage />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
