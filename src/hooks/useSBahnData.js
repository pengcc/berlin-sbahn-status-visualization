import { useState, useEffect } from 'react';

const useSbahndata = (datapath) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In production, replace with actual API call
        const response = await import(`../data/${datapath}.json`);
        setData(response.default);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [datapath]);

  return { data, loading, error }; // Properly structured return
};

export default useSbahndata;
