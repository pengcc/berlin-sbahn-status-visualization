import { Grid, Container } from '@mui/material';
import useSbahndata from '../hooks/useSBahnData';
import StatusSummaryCard from '@/components/StatusSummary/StatusSummaryCard';
import LineStatusChart from '../components/LineStatus/LineStatusChart';
import StationStatusChart from '../components/StationStatus/StationStatusChart';
import TimelineChart from '../components/Timeline/TimelineChart';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const { data, loading, error } = useSbahndata();

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error loading data</div>;
  if (!data) return <div>No data available</div>;

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <StatusSummaryCard summary={data.summary} />
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <LineStatusChart lines={data.summary.most_affected_lines} lineStatus={data.line_status} />
        </Grid>

        <Grid item xs={12} md={6} lg={5}>
          <StationStatusChart stations={data.summary.most_affected_stations} />
        </Grid>

        <Grid item xs={12}>
          <TimelineChart hourlyActivity={data.summary.hourly_activity} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
