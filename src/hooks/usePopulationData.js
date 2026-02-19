import { useState, useEffect } from 'react';
import { API_ROOT as API_BASE_URL } from '../lib/apiConfig';


const usePopulationData = () => {
    const [data, setData] = useState({
        flow: [],
        risk: [],
        mutations: [],
        triage: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [flowRes, riskRes, mutationsRes, triageRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/population/flow`),
                    fetch(`${API_BASE_URL}/api/population/risk_distribution`),
                    fetch(`${API_BASE_URL}/api/population/top_mutations`),
                    fetch(`${API_BASE_URL}/api/population/triage_list`),
                ]);

                if (!flowRes.ok || !riskRes.ok || !mutationsRes.ok || !triageRes.ok) {
                    throw new Error('Failed to fetch population data');
                }

                const flowData = await flowRes.json();
                const riskData = await riskRes.json();
                const mutationsData = await mutationsRes.json();
                const triageData = await triageRes.json();
                
                // Add colors for charts
                const flowColors = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c'];
                const riskColors = ['#ef4444', '#f97316', '#facc15', '#4ade80'];

                setData({
                    flow: flowData.data.map((item, index) => ({ ...item, fill: flowColors[index % flowColors.length] })),
                    risk: riskData.data.map((item, index) => ({ ...item, fill: riskColors[index % riskColors.length] })),
                    mutations: mutationsData.data,
                    triage: triageData.data,
                });

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { ...data, loading, error };
};

export default usePopulationData; 