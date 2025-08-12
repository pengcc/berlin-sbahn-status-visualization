import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from 'recharts';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';

const LineDisruptionDaysChart = ({ lines, periodDays }) => {
  const theme = useTheme();

  // Sort lines by disruption days for better visualization
  const sortedLines = [...lines].sort((a, b) => b.distribution_days - a.distribution_days);

  const chartData = sortedLines.map((line) => ({
    name: line.line,
    'Disruption Days': line.distribution_days,
    'Available Days': periodDays - line.distribution_days,
    availability: line.distribution_index,
  }));

  // Calculate dynamic bar size based on number of lines
  const barSize = Math.max(20, 50 - lines.length); // Minimum 20px, reduces with more lines

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Line Availability (July 2025)
        </Typography>
        <Box
          sx={{
            height: 400 + lines.length * 10, // Dynamic height
            minHeight: 400, // Minimum height
          }}
        >
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 100, bottom: 80 }}
              layout='vertical'
              barGap={2} // Gap between stacked bars
              barCategoryGap={10} // Gap between different lines
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis type='number' domain={[0, periodDays]} tickCount={periodDays + 1}>
                <Label value='Days' offset={0} position='insideBottom' />
              </XAxis>
              <YAxis
                dataKey='name'
                type='category'
                width={120}
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <Tooltip
                formatter={(value, name) => [`${value} days`, name]}
                labelFormatter={(label) => `Line ${label}`}
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  borderColor: theme.palette.divider,
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                formatter={(value) => (
                  <span style={{ color: theme.palette.text.primary }}>{value}</span>
                )}
              />
              <Bar
                dataKey='Disruption Days'
                stackId='a'
                fill={theme.palette.error.main}
                name='Disruption Days'
                barSize={barSize} // Dynamic bar size
              />
              <Bar
                dataKey='Available Days'
                stackId='a'
                fill={theme.palette.success.main}
                name='Available Days'
                barSize={barSize} // Dynamic bar size
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LineDisruptionDaysChart;
