import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header, Footer } from '@/components/layout';
import { HistoryDashboard, LineLiveStatus } from '@/pages';
import { Box } from '@mui/material';

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Box component='main' sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path='/' element={<LineLiveStatus />} />
            <Route path='/analytics' element={<HistoryDashboard />} />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Router>
  );
}

export default App;
