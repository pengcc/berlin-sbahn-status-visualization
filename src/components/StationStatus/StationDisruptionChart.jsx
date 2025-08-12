import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from 'recharts';
import { Card, CardContent, Typography, Box, useTheme, Chip } from '@mui/material';

const StationDisruptionChart = ({ stations }) => {
  const theme = useTheme();

  const chartData = stations.map((station) => ({
    name: station.station,
    disruptions: station.disruptions,
    lines: station.affected_lines.length,
    lastOccurrence: new Date(station.last_occurrence).toLocaleDateString(),
  }));

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Station Disruption Overview
        </Typography>
        <Box sx={{ height: 500 }}>
          <ResponsiveContainer width='100%' height='100%'>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='name'
                name='Station'
                angle={-45}
                textAnchor='end'
                height={100}
                tick={{ fontSize: 12 }}
              >
                <Label value='Station Name' offset={0} position='insideBottom' />
              </XAxis>
              <YAxis dataKey='disruptions' name='Disruptions'>
                <Label
                  angle={-90}
                  value='Number of Disruptions'
                  position='insideLeft'
                  style={{ textAnchor: 'middle' }}
                />
              </YAxis>
              <ZAxis dataKey='lines' name='Affected Lines' range={[50, 1000]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                }}
                formatter={(value, name) => {
                  if (name === 'lastOccurrence') return [value, 'Last Disruption'];
                  return [value, name];
                }}
                labelFormatter={(label) => `Station: ${label}`}
              />
              <Legend />
              <Scatter
                name='Stations'
                data={chartData}
                fill={theme.palette.primary.main}
                shape='circle'
              />
            </ScatterChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip label='Circle size = Number of affected lines' size='small' variant='outlined' />
          <Chip
            label={`Data period: ${chartData[0]?.lastOccurrence} to ${chartData[chartData.length - 1]?.lastOccurrence}`}
            size='small'
            variant='outlined'
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default StationDisruptionChart;
