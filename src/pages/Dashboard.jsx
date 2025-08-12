import { Grid, Container, Typography } from '@mui/material';
import useSBahndata from '../hooks/useSBahnData';
import CategoryBreakdownChart from '@/components/CategoryBreakdown/CategoryBreakdownChart';
import LineDisruptionChart from '@/components/LineStatus/LineDisruptionChart';
import LineDisruptionDaysChart from '@/components/LineStatus/LineDisruptionDaysChart';
import StationDisruptionChart from '@/components/StationStatus/StationDisruptionChart';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const Dashboard = () => {
  const { data, loading, error } = useSBahndata('sbahn-data-202507');

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error loading data</div>;
  if (!data) return <div>No data available</div>;

  // Calculate dynamic height based on number of lines
  const chartHeight = 400 + data.lines.length * 15; // Base height + per line adjustment

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <Typography variant='h4' gutterBottom>
        S-Bahn Disruption Overview ({data.metadata.period.start} to {data.metadata.period.end})
      </Typography>

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
