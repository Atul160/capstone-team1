import React, { useCallback, useMemo, useState } from "react";
import { Computer } from "@/app/types/Smartlist";
import debounce from "lodash/debounce";
import { Alert, Card, Col, Select, Spin } from "antd";
import { Cell, Label, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const STATUS_COLORS = ["#1bbf29", "#ffc658", "#ef6827", "#8884d8"]; // Colors for different statuses

const VMStatusChart: React.FC<{ vmData: Computer[], vmLoading: boolean }> = ({
    vmData,
    vmLoading
}) => {
    const [error, setError] = useState<Error | null>(null);
    const availableAreas = useMemo(() => [...new Set(vmData.map(vm => vm.tags?.find(tag => tag.name === "Area")?.value || "Unknown"))], [vmData]);
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const debouncedSetSelectedAreas = useCallback(debounce(setSelectedAreas, 100), []);

    const filteredVMData = useMemo(() => {
        try {
            if (selectedAreas.length === 0) return vmData;
            return vmData.filter(vm => {
                const areaTag = vm.tags?.find(tag => tag.name === "Area");
                return areaTag && selectedAreas.includes(areaTag.value!);
            });
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Unknown error"));
            return [];
        }
    }, [vmData, selectedAreas]);

    const statusBreakdown = filteredVMData.reduce((acc: Record<string, number>, vm) => {
        const status = vm.status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const chartData = useMemo(() => Object.keys(statusBreakdown).map(status => ({
        status,
        count: statusBreakdown[status],
    })), [statusBreakdown]);

    const handleAreaChange = useCallback((value: string[]) => {
        debouncedSetSelectedAreas(value);
    }, [debouncedSetSelectedAreas]);


    return (
        <Col xs={24} sm={12} lg={8}>
            <Card title="VM Status Distribution" hoverable>
                <Spin spinning={vmLoading}>
                    {error ? (
                        <Alert message="Error" description={error.message} type="error" showIcon />
                    ) : (
                        <>
                            <Select
                                mode={"multiple"}
                                value={selectedAreas}
                                onChange={handleAreaChange}
                                className="mb-4"
                                allowClear
                                placeholder={"Select Area"}
                                style={{ width: "50%", marginRight: 5, marginBottom: 20 }}
                                options={availableAreas.map(area => ({ value: area, label: area }))}
                            />
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                                    <Pie data={chartData}
                                        labelLine={true}
                                        label={({ name, count }) => `${name} (${count})`}
                                        dataKey="count"
                                        nameKey="status" cx="50%" cy="50%"
                                        innerRadius={window.innerWidth < 768 ? 40 : 60}
                                        outerRadius={window.innerWidth < 768 ? 80 : 100}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`}
                                                fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                        ))}
                                        <Label value={`Total: ${chartData.reduce((sum, data) => sum + data.count, 0)}`}
                                            position="center" />

                                    </Pie>

                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </>
                    )}
                </Spin>
            </Card>
        </Col>
    );
};

export default VMStatusChart;