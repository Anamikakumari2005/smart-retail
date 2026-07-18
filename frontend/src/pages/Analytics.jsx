import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";

export default function Analytics() {
    const [predictions, setPredictions] = useState([]);
    const [anomalyRisks, setAnomalyRisks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState('');

    useEffect(() => {
        loadPredictions();
    }, []);

    const loadPredictions = async () => {
        try {
            // Next week sales predictions
            const res1 = await axiosInstance.get('/api/analytics/sales-forecast');
            setPredictions(res1.data);

            // Anomaly risks
            const res2 = await axiosInstance.get('/api/analytics/anomaly-risks');
            setAnomalyRisks(res2.data);
        } catch (err) {
            console.error('Error loading predictions');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '48px' }}>Loading...</div>;

    return (
        <div style={{ padding: '32px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>📈 Predictive Analytics</h1>

            {/* Sales Forecast Section */}
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>📊 Next Week Sales Forecast</h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                    {predictions.map((pred) => (
                        <div key={pred.product_id} style={{
                            backgroundColor: 'white',
                            padding: '24px',
                            borderRadius: '12px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <h3 style={{ margin: '0 0 12px 0', color: '#111827' }}>
                                {pred.product_id}
                            </h3>

                            <div style={{ marginBottom: '16px' }}>
                                <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>Current Trend</p>
                                <p style={{
                                    fontSize: '20px',
                                    fontWeight: 'bold',
                                    color: pred.current_trend > 0 ? '#16a34a' : '#dc2626',
                                    margin: '4px 0 0 0'
                                }}>
                                    {pred.current_trend > 0 ? '📈' : '📉'} {pred.current_trend.toFixed(1)}%
                                </p>
                            </div>

                            <div style={{ backgroundColor: '#f3f4f6', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                                <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 8px 0' }}>Next 7 Days Forecast:</p>
                                {pred.next_7_days.map((day, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', margin: '6px 0', color: '#111827' }}>
                                        <span>{day.day}</span>
                                        <strong>{Math.round(day.predicted_quantity)} units</strong>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>Confidence: {Math.round(pred.confidence)}%</span>
                                <div style={{
                                    width: '60px',
                                    height: '8px',
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${pred.confidence}%`,
                                        height: '100%',
                                        backgroundColor: '#3b82f6'
                                    }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Anomaly Risk Section */}
            <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>⚠️ Anomaly Risk Prediction</h2>

                <div style={{ display: 'grid', gap: '12px' }}>
                    {anomalyRisks.map((risk) => {
                        const riskColor = risk.risk_score > 70 ? '#dc2626' : risk.risk_score > 50 ? '#f59e0b' : '#f59e0b';
                        const riskIcon = risk.risk_score > 70 ? '🔴' : risk.risk_score > 50 ? '🟠' : '🟡';

                        return (
                            <div key={risk.product_id} style={{
                                backgroundColor: 'white',
                                padding: '20px',
                                borderRadius: '12px',
                                borderLeft: `4px solid ${riskColor}`,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 4px 0', color: '#111827' }}>
                                            {risk.product_name} ({risk.product_id})
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                                            Avg Daily Sales: {risk.avg_daily_sales} units | Current Stock: {risk.current_stock}
                                        </p>
                                    </div>
                                    <span style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        color: riskColor
                                    }}>
                                        {riskIcon} {risk.risk_score.toFixed(1)}%
                                    </span>
                                </div>

                                <div style={{
                                    backgroundColor: '#f3f4f6',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '12px',
                                    fontSize: '13px',
                                    color: '#111827'
                                }}>
                                    {risk.recommendation}
                                </div>

                                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                    Variability: {risk.variability.toFixed(1)}% | Stock Risk: {risk.stock_risk}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}