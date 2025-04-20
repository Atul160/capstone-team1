"use client"; // Required for Next.js App Router

import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const salesData = [
    { category: "Electronics", sales: 400 },
    { category: "Furniture", sales: 300 },
    { category: "Clothing", sales: 500 },
    { category: "Books", sales: 200 },
    { category: "Toys", sales: 350 }
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const PieChartComponent = () => {
    return (
        <div className="w-full max-w-lg h-[400px] p-4 bg-white shadow-lg rounded-lg">
            <h2 className="text-lg font-bold mb-4 text-center">Sales Distribution</h2>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={salesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="sales"
                        nameKey="category"
                    >
                        {salesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PieChartComponent;
