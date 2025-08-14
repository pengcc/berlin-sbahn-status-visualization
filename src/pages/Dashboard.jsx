import {
  Grid,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import useSBahndata from '../hooks/useSBahnData';
import CategoryBreakdownChart from '@/components/CategoryBreakdown/CategoryBreakdownChart';
import LineDisruptionChart from '@/components/LineStatus/LineDisruptionChart';
import LineDisruptionDaysChart from '@/components/LineStatus/LineDisruptionDaysChart';
import StationDisruptionChart from '@/components/StationStatus/StationDisruptionChart';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useState } from 'react';

const availableDatasets = [
  { id: 'sbahn-data-202507', label: 'July 2025' },
  { id: 'sbahn-data-202506', label: 'June 2025' },
];

const Dashboard = () => {
  const [selectedDataset, setSelectedDataset] = useState(availableDatasets[0].id);
  const { data, loading, error } = useSBahndata(selectedDataset);

  const handleDatasetChange = (event) => {
    setSelectedDataset(event.target.value);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error loading data</div>;
  if (!data) return <div>No data available</div>;

  // Responsive height calculation
  const chartHeight = 300 + data.lines.length * (window.innerWidth < 600 ? 10 : 15);

  return (
    <Container maxWidth='xl' sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 2,
          gap: 1,
        }}
      >
        <Typography variant='h4' sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }} gutterBottom>
          S-Bahn Disruptions ({data.metadata.period.start} to {data.metadata.period.end})
        </Typography>

        <FormControl sx={{ minWidth: 120 }} size='small'>
          <InputLabel id='dataset-select-label'>Dataset</InputLabel>
          <Select
            labelId='dataset-select-label'
            value={selectedDataset}
            label='Dataset'
            onChange={handleDatasetChange}
          >
            {availableDatasets.map((dataset) => (
              <MenuItem key={dataset.id} value={dataset.id}>
                {dataset.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6} sx={{ minHeight: { xs: 300, sm: 400 } }}>
          <CategoryBreakdownChart categories={data.categories} />
        </Grid>

        <Grid item xs={12} md={6} sx={{ minHeight: { xs: 300, sm: 400 } }}>
          <LineDisruptionChart lines={data.lines} />
        </Grid>

        <Grid item xs={12} sx={{ height: { xs: 'auto', sm: chartHeight }, minHeight: 300 }}>
          <LineDisruptionDaysChart lines={data.lines} periodDays={data.metadata.period.days} />
        </Grid>

        <Grid item xs={12} sx={{ minHeight: { xs: 300, sm: 400 } }}>
          <StationDisruptionChart stations={data.stations} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
