import React, {useEffect, useState} from "react";
import {Cell, Pie, PieChart, ResponsiveContainer, Tooltip} from "recharts";
import {useSiteData} from "@/app/context/SiteDataContext";
import {Card, Col, Select, Spin} from "antd";
import '../DashboardCharts.css';

const {Option} = Select;
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const SiteCharts = () => {
    const [edgeTypeData, setEdgeTypeData] = useState<{ EdgeType: string; count: number }[]>([]);
    const [businessUnitData, setBusinessUnitData] = useState<{ businessUnit: string; count: number }[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedData, setSelectedData] = useState<string>("EdgeType");
    const {siteData} = useSiteData();

    useEffect(() => {
        setLoading(!siteData || !Array.isArray(siteData) || siteData.length === 0);
        setTimeout(() => {
            setEdgeTypeData([
                {EdgeType: "Stores", count: (siteData?.filter((item) => item.edgeType == "Store"))?.length ?? 0},
                {EdgeType: "DC", count: (siteData?.filter((item) => item.edgeType == "DC"))?.length ?? 0}
            ]);
            setBusinessUnitData([
                {businessUnit: "SAMS", count: (siteData?.filter((item) => item.businessUnit == "Sams"))?.length ?? 0},
                {
                    businessUnit: "Walmart",
                    count: (siteData?.filter((item) => item.businessUnit == "Walmart"))?.length ?? 0
                },
                {
                    businessUnit: "Other",
                    count: (siteData?.filter((item) => !item.businessUnit?.match(/Walmart|Sams/)))?.length ?? 0
                }
            ]);
        }, 0);
    }, [siteData]);

    const handleDataChange = (value: string) => {
        setSelectedData(value);
    };

    const getData = () => {
        switch (selectedData) {
            case "EdgeType":
                return edgeTypeData;
            case "businessUnit":
                return businessUnitData;
            default:
                return [];
        }
    };

    return (
        <Col xs={24} sm={12} lg={8}>
            <Card className="chart-card" title="Site Distribution" hoverable>
                <Spin spinning={loading}>
                    <Select
                        style={{width: "80%", marginBottom: 20}}
                        placeholder="Select Data Type"
                        onChange={handleDataChange}
                        value={selectedData}
                    >
                        <Option value="EdgeType">Edge Type</Option>
                        <Option value="businessUnit">Business Unit</Option>
                    </Select>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart margin={{top: 10, right: 10, left: 10, bottom: 5}}>
                            <Pie
                                data={getData()}
                                cx="50%"
                                cy="50%"
                                outerRadius={window.innerWidth < 768 ? 70 : 90}
                                // labelLine={true}
                                // label={({ name, count }) => `${name} (${count})`}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey={selectedData === "EdgeType" ? "EdgeType" : "businessUnit"}
                            >
                                {getData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                ))}
                            </Pie>
                            <Tooltip/>
                            {/*<Legend />*/}
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{marginTop: 20, textAlign: "center", fontSize: "14px", color: "#333"}}>
                        {getData().map((entry, index) => (
                            <div key={`label-${index}`}
                                 style={{color: COLORS[index % COLORS.length], fontWeight: "bold"}}>
                                {entry[selectedData as keyof typeof entry]}: {entry.count}
                            </div>
                        ))}
                    </div>
                </Spin>
            </Card>
        </Col>
    );
};

export default SiteCharts;