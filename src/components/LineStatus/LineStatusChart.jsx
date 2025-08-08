import { Card, CardContent, Typography, Stack } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatusIcon from '../common/StatusIcon';

const LineStatusChart = ({ lines, lineStatus }) => {
  const chartData = lines.map(line => ({
    name: line,
    disruption: lineStatus[line]?.disruption || 0,
    delay: lineStatus[line]?.delay || 0,
    construction: lineStatus[line]?.construction || 0,
    information: lineStatus[line]?.information || 0,
  }));

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Most Affected Lines
        </Typography>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            stackOffset="expand"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="disruption" stackId="a" fill="#ff5722" name="Disruption" />
            <Bar dataKey="delay" stackId="a" fill="#ffc107" name="Delay" />
            <Bar dataKey="construction" stackId="a" fill="#2196f3" name="Construction" />
            <Bar dataKey="information" stackId="a" fill="#4caf50" name="Information" />
          </BarChart>
        </ResponsiveContainer>

        <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
          <StatusIcon status="disruption" />
          <StatusIcon status="delay" />
          <StatusIcon status="construction" />
          <StatusIcon status="information" />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default LineStatusChart;