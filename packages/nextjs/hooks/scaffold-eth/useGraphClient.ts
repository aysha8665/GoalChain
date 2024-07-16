import { useEffect, useState } from "react";
import { execute } from "../../../../.graphclient";

export const useGraphClient = (query: any) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]: any = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const { data: result } = await execute(query, {});
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  return { data, loading, error };
};

export default useGraphClient;
