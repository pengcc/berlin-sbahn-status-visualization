import { Card, CardContent, Typography, Stack, Divider } from '@mui/material';
import StatusBadge from '../common/StatusBadge';

const StatusSummaryCard = ({ summary }) => {
  const { total_tweets, status_distribution } = summary;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          S-Bahn Status Summary
        </Typography>

        <Typography variant='body2' color='text.secondary' mb={2}>
          Total updates: {total_tweets}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant='subtitle1' gutterBottom>
          Status Distribution
        </Typography>

        <Stack spacing={1}>
          {Object.entries(status_distribution).map(([status, count]) => (
            <Stack key={status} direction='row' alignItems='center' spacing={2}>
              <StatusBadge status={status} />
              <Typography variant='body2'>
                {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StatusSummaryCard;
