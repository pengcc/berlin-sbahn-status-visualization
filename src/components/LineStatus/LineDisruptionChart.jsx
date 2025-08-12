import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, Typography } from '@mui/material';

const LineDisruptionChart = ({ lines }) => {
  const chartData = lines.map((line) => ({
    name: line.line,
    disruptions: line.disruptions,
    resolved: line.common_issues.recovery_resolved || 0,
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Line Disruptions
        </Typography>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey='disruptions' fill='#ff5722' name='Total Disruptions' />
            <Bar dataKey='resolved' fill='#4caf50' name='Resolved Issues' />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LineDisruptionChart;
