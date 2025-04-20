import {Computer} from "@/app/types/Smartlist";
import React, {useCallback, useMemo, useState} from "react";
import debounce from "lodash/debounce";
import {Card, Col, Select, Spin} from "antd";
import {Cell, Label, Pie, PieChart, ResponsiveContainer, Tooltip} from "recharts";

type ProcessedOSData = {
    category: string;
    count: number;
    breakdown: Record<string, number>;
};

const OS_CATEGORIES: Record<string, string> = {
    Nutanix: "Nutanix",
    VMware: "VMWare"
};

const COLORS = ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F", "#EDC949", "#AF7AA1", "#FF9DA7", "#9C755F", "#BAB0AC"];

const processHostOSData = (hostData: Computer[], selectedAreas: string[]): ProcessedOSData[] => {
    const osCount: Record<string, number> = {};
    const osBreakdown: Record<string, Record<string, number>> = {};

    hostData.forEach((host) => {
        const osFamily = host.operating_system && host.operating_system.family ? OS_CATEGORIES[host.operating_system.family] || "Others" : "Others";
        const osNameVersion = `${host.operating_system?.name || "Unknown"} ${host.operating_system?.version || "Unknown"}`;

        const areaTag = host.tags?.find((tag) => tag.name === "Area");
        if (selectedAreas.length > 0 && (!areaTag || !selectedAreas.includes(areaTag.value!))) {
            return; // Skip VMs that do not match the selected area
        }
        osCount[osFamily] = (osCount[osFamily] || 0) + 1;
        osBreakdown[osFamily] = osBreakdown[osFamily] || {};
        osBreakdown[osFamily][osNameVersion] = (osBreakdown[osFamily][osNameVersion] || 0) + 1;
    });

    return Object.keys(osCount).map((category) => ({
        category: category,
        count: osCount[category],
        breakdown: osBreakdown[category],
    }));
};


export const HostOSAreaChart: React.FC<{ hostData: Computer[], hostLoading: boolean }> = ({
                                                                                              hostData,
                                                                                              hostLoading
                                                                                          }) => {

    const availableAreas = useMemo(() => [...new Set(hostData.map(vm => vm.tags?.find(tag => tag.name === "Area")?.value || "Unknown"))], [hostData]);

    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const debouncedSetSelectedAreas = useCallback(debounce(setSelectedAreas, 100), []);


    const chartData = useMemo(() => {
        const processed = processHostOSData(hostData, selectedAreas);
        if (!processed || processed.length === 0) {
            return [
                {category: "VMWare", count: 0, breakdown: {}},
                {category: "Nutanix", count: 0, breakdown: {}},
            ];
        }
        return processed;
    }, [hostData, selectedAreas]);

    const totalCount = chartData.reduce((sum, data) => sum + data.count, 0);

    const handleAreaChange = useCallback((value: string[]) => {
        debouncedSetSelectedAreas(value);
    }, [debouncedSetSelectedAreas]);

    // console.log(chartData)
    return (
        <Col xs={24} sm={12} lg={8}>
            <Card title="Host OS Distribution" hoverable>
                <Spin spinning={hostLoading}>
                    {/* Area Filter */}
                    <Select
                        mode={"multiple"}
                        value={selectedAreas}
                        onChange={handleAreaChange}
                        className="mb-4"
                        allowClear
                        placeholder={"Select Area"}
                        style={{width: "80%", marginRight: 5, marginBottom: 20}}
                        options={availableAreas.map(area => ({value: area, label: area}))}
                    />
                    {/* Pie Chart */}
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart margin={{top: 20, right: 10, left: 10, bottom: 5}}>
                            <Pie data={chartData}
                                // labelLine={true}
                                // label={({ name, count }) => `${name} (${count})`}
                                 dataKey="count"
                                 nameKey="category" cx="50%" cy="50%"
                                 innerRadius={window.innerWidth < 768 ? 40 : 60}
                                 outerRadius={window.innerWidth < 768 ? 80 : 90}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                ))}
                                <Label value={`Total:  ${totalCount}`} position="center" style={{fontWeight: "bold"}}/>
                            </Pie>
                            <Tooltip formatter={(value, name, props) => {
                                const category = props.payload.category;
                                const breakdown = chartData.find((d) => d.category === category)?.breakdown;

                                if (breakdown) {
                                    return [
                                        < div key=" " style={{textAlign: "left"}}>
                                            {Object.entries(breakdown).map(([os, count], index) => (
                                                <div key={os}>
                                                    <span style={{
                                                        fontWeight: "bold",
                                                        color: COLORS[index % COLORS.length]
                                                    }}>{os} : {count}</span>
                                                </div> // ✅ Line break using <div>
                                            ))}
                                        </div>,
                                        category,
                                    ];
                                }
                                return [value, name];
                            }}/>
                            {/*<Legend/>*/}
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{marginTop: 20, textAlign: "center", fontSize: "14px", color: "#333"}}>
                        {chartData.map((entry, index) => (
                            <div key={`label-${index}`}
                                 style={{color: COLORS[index % COLORS.length], fontWeight: "bold"}}>
                                {entry.category}: {entry.count}
                            </div>
                        ))}
                    </div>
                </Spin>
                {/*<Meta title= "VM OS Distribution"/>*/}
            </Card>
        </Col>
    );
};

export default HostOSAreaChart;