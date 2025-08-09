import { Card, CardContent, Typography } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const TimelineChart = ({ hourlyActivity }) => {
  const chartData = Object.entries(hourlyActivity).map(([hour, count]) => ({
    hour: `${hour}:00`,
    count,
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Activity Timeline
        </Typography>

        <ResponsiveContainer width='100%' height={300}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='hour' />
            <YAxis />
            <Tooltip />
            <Area type='monotone' dataKey='count' stroke='#8884d8' fill='#8884d8' />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TimelineChart;
