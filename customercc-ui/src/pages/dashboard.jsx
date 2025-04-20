/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { AreaChart, Area } from "recharts";
import { BarChart, Bar } from "recharts";

function Sidebar({ isOpen, toggleSidebar }) {
    return (
        <div className={`fixed h-full bg-gray-800 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
            <button onClick={toggleSidebar} className="p-2">☰</button>
        </div>
    );
}

function Header() {
    return (
        <div className="bg-gray-200 p-4 text-xl font-bold">Dashboard</div>
    );
}

function FilterComponent({ selectedFilter, setSelectedFilter }) {
    return (
        <div>
            <label className="mr-2">Filter:</label>
            <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
            </select>
        </div>
    );
}

function PieChartFilterComponent({ selectedFilter, setSelectedFilter, pieData }) {
    const filteredData = pieData.filter((entry) => entry.name === selectedFilter || selectedFilter === "All");

    return (
        <div>
            <label className="mr-2">Pie Chart Filter:</label>
            <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Category 1">Category 1</option>
                <option value="Category 2">Category 2</option>
                <option value="Category 3">Category 3</option>
            </select>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie data={filteredData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#82ca9d" label>
                        {filteredData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index]} />
                        ))}
                    </Pie>
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

const sampleData = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 500 },
    { name: "Apr", value: 700 },
];

const pieData = [
    { name: "Category 1", value: 40 },
    { name: "Category 2", value: 30 },
    { name: "Category 3", value: 20 },
    { name: "Category 4", value: 10 },
];

export default function Dashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState("All");
    const [pieChartFilter, setPieChartFilter] = useState("All");

    return (
        <div className="flex h-screen">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-16'}`}>
                <Header />
                <div className="p-4">
                    <FilterComponent selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={sampleData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Line type="monotone" dataKey="value" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                    <PieChartFilterComponent selectedFilter={pieChartFilter} setSelectedFilter={setPieChartFilter} pieData={pieData} />
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={sampleData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                        </AreaChart>
                    </ResponsiveContainer>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={sampleData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
