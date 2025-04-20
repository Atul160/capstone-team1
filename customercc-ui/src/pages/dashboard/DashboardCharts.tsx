import React, {useContext} from "react";
import {AuthContext} from "@/app/context/AuthProvider";
import VMCharts from "./charts/vms/VMCharts";
import HostCharts from "@/app/components/content/dashboard/charts/hosts/HostCharts";
import '@/app/components/content/dashboard/charts/DashboardCharts.css';

import {useCombinedData} from "@/app/components/content/dashboard/ComputerData";
import {Row} from "antd";

const DashboardCharts = () => {
    const authCtx = useContext(AuthContext);

    const {hostData, vmData, loading} = useCombinedData(authCtx)

    return (
        <div style={{padding: '14px'}}>
            <Row gutter={[16, 16]}>
                {/*<SiteCharts/>*/}
                <HostCharts hostData={hostData} hostLoading={loading}/>
                <VMCharts vmData={vmData} vmLoading={loading}/>
            </Row>
        </div>
    );
};

export default DashboardCharts;