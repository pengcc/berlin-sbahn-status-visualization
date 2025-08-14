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

// List of available datasets
const availableDatasets = [
  { id: 'sbahn-data-202507', label: 'July 2025' },
  { id: 'sbahn-data-202506', label: 'June 2025' },
  // Add more datasets as needed
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

  // Calculate dynamic height based on number of lines
  const chartHeight = 400 + data.lines.length * 15; // Base height + per line adjustment

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant='h4' gutterBottom>
          S-Bahn Disruption Overview ({data.metadata.period.start} to {data.metadata.period.end})
        </Typography>

        <FormControl sx={{ minWidth: 150 }} size='small'>
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} sx={{ minHeight: 400 }}>
          <CategoryBreakdownChart categories={data.categories} />
        </Grid>

        <Grid item xs={12} md={6} sx={{ minHeight: 400 }}>
          <LineDisruptionChart lines={data.lines} />
        </Grid>

        <Grid item xs={12} sx={{ height: chartHeight }}>
          <LineDisruptionDaysChart lines={data.lines} periodDays={data.metadata.period.days} />
        </Grid>

        <Grid item xs={12} sx={{ minHeight: 400 }}>
          <StationDisruptionChart stations={data.stations} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
