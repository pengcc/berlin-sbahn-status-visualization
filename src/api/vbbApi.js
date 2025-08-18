const API_BASE = 'https://v6.vbb.transport.rest';

export const fetchAllSBahnStatus = async () => {
  try {
    // Fetch all S-Bahn lines in Berlin with more specific parameters
    const linesResponse = await fetch(
      `${API_BASE}/lines?product=suburban&mode=suburban&suburban=Berlin`
    );
    const allLines = await linesResponse.json();

    // Fetch disruptions specifically for Berlin S-Bahn
    const disruptionsResponse = await fetch(
      `${API_BASE}/disruptions?product=suburban&mode=suburban&suburban=Berlin`
    );
    const allDisruptions = await disruptionsResponse.json();

    // Create disruption map by line name instead of ID
    const disruptionMap = new Map();
    allDisruptions.forEach((disruption) => {
      disruption.lines?.forEach((line) => {
        const lineName = line.name;
        if (!disruptionMap.has(lineName)) {
          disruptionMap.set(lineName, []);
        }
        disruptionMap.get(lineName).push(disruption);
      });
    });

    // Prepare status data
    return allLines.map((line) => {
      const lineName = line.name;
      const disruptions = disruptionMap.get(lineName) || [];

      return {
        id: line.id,
        name: lineName,
        status: disruptions.length > 0 ? 'disrupted' : 'normal',
        disruptions: disruptions.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          from: d.from || null,
          until: d.until || null,
        })),
      };
    });
  } catch (error) {
    console.error('Error fetching all S-Bahn status:', error);
    return [];
  }
};
