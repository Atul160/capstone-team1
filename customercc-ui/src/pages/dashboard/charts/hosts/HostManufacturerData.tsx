import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {Card, Col, Select, Spin} from "antd";
import '../DashboardCharts.css';
import {motion} from "framer-motion";
import debounce from 'lodash/debounce';
import {Computer} from "@/app/types/Smartlist";


const COLORS = ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F", "#EDC949", "#AF7AA1", "#FF9DA7", "#9C755F", "#BAB0AC"];

const CustomTotalLabel = ({x, y, width, value}: { x: number; y: number; width: number; value: number }) => (
    <text x={x + width / 2} y={y - 10} fill="#000" textAnchor="middle" fontSize={14} fontWeight="bold"
          style={{textAlign: "left"}}>
        {value}
    </text>
);

type ManufacturerData = {
    manufacturer: string;
    count: number;
};

type AreaData = {
    area: string;
    manufacturers: ManufacturerData[];
};

const useHostManufacturerData = (hostData: Computer[], hostLoading: boolean) => {
    const [hostManufacturerAreaData, setHostManufacturerAreaData] = useState<AreaData[]>([]);

    useEffect(() => {
        if (!hostLoading) {
            const areaManufacturerCount = hostData.reduce((acc: Record<string, Record<string, number>>, host) => {
                const area = host.tags?.find(tag => tag.name === "Area")?.value || "Unknown";
                const manufacturer = host.manufacturer || "Unknown";

                if (!acc[area]) acc[area] = {};
                acc[area][manufacturer] = (acc[area][manufacturer] || 0) + 1;

                return acc;
            }, {});

            const manufacturerAreaData = Object.keys(areaManufacturerCount).map(area => ({
                area,
                manufacturers: Object.entries(areaManufacturerCount[area]).map(([manufacturer, count]) => ({
                    manufacturer,
                    count
                }))
            }));

            setHostManufacturerAreaData(manufacturerAreaData);
        }
    }, [hostData, hostLoading]);

    return hostManufacturerAreaData;
};

const useFilteredData = (hostManufacturerAreaData: AreaData[], selectedAreas: string[], selectedManufacturers: string[]) => {
    return useMemo(() => {
        return hostManufacturerAreaData
            .filter(entry => !selectedAreas.length || selectedAreas.includes(entry.area))
            .map(entry => {
                const totalCount = entry.manufacturers
                    .filter(m => !selectedManufacturers.length || selectedManufacturers.includes(m.manufacturer))
                    .reduce((sum, m) => sum + m.count, 0);

                return {
                    area: entry.area,
                    total: totalCount,
                    ...entry.manufacturers
                        .filter(m => !selectedManufacturers.length || selectedManufacturers.includes(m.manufacturer))
                        .reduce((acc, m) => ({...acc, [m.manufacturer]: m.count}), {}),
                };
            })
            .filter(entry => Object.keys(entry).length > 1);
    }, [hostManufacturerAreaData, selectedAreas, selectedManufacturers]);
};

const HostManufacturerAreaChart: React.FC<{ hostData: Computer[], hostLoading: boolean, }> = ({
                                                                                                  hostData,
                                                                                                  hostLoading
                                                                                              }) => {
    const hostManufacturerAreaData = useHostManufacturerData(hostData, hostLoading);
    const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
    const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);

    const allAreas = useMemo(() => [...new Set(hostManufacturerAreaData.map(entry => entry.area))], [hostManufacturerAreaData]);
    const allManufacturers = useMemo(() => [...new Set(hostManufacturerAreaData.flatMap(entry => entry.manufacturers.map(m => m.manufacturer)))], [hostManufacturerAreaData]);

    const filteredAreaData = useFilteredData(hostManufacturerAreaData, selectedAreas, selectedManufacturers);

    const debouncedSetSelectedAreas = useCallback(debounce(setSelectedAreas, 100), []);
    const debouncedSetSelectedManufacturers = useCallback(debounce(setSelectedManufacturers, 100), []);

    return (
        <Col xs={24} sm={12} lg={8}>
            <Card className="chart-card" title="Host Manufacturer Distribution" hoverable>
                <Spin spinning={hostLoading}>
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.8}}>
                        <div className="filters">
                            <Select
                                mode={"multiple"}
                                style={{width: "30%", marginRight: 20, marginBottom: 20}}
                                options={allAreas.map(area => ({value: area, label: area}))}
                                onChange={debouncedSetSelectedAreas}
                                placeholder="Select Areas.."
                                allowClear
                            />
                            <Select
                                mode={"multiple"}
                                style={{width: "60%", marginBottom: 20}}
                                options={allManufacturers.map(manufacturer => ({
                                    value: manufacturer,
                                    label: manufacturer
                                }))}
                                onChange={debouncedSetSelectedManufacturers}
                                placeholder="Select Manufacturers.."
                                allowClear
                            />
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={filteredAreaData} margin={{top: 20, right: 10, left: 10, bottom: 5}}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="area" stroke="#333"/>
                                <YAxis/>
                                <Tooltip/>
                                <Legend/>
                                {allManufacturers.map((manufacturer, index) => {
                                    const isLast = index === allManufacturers.length - 1;
                                    return (
                                        <Bar key={manufacturer} dataKey={manufacturer} stackId="a"
                                             fill={COLORS[index % COLORS.length]}>
                                            {isLast && <LabelList dataKey="total"
                                                                  content={<CustomTotalLabel x={0} y={0} width={0}
                                                                                             value={0}/>}/>}
                                        </Bar>
                                    );
                                })}

                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                </Spin>
            </Card>
        </Col>
    );
};

export default HostManufacturerAreaChart;