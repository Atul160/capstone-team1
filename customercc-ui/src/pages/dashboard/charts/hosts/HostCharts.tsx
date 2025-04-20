import React from "react";
import HostManufacturerAreaChart from "@/app/components/content/dashboard/charts/hosts/HostManufacturerData";
import HostOSAreaChart from "@/app/components/content/dashboard/charts/hosts/HostOSData";
import SiteCharts from "@/app/components/content/dashboard/charts/sites/SiteCharts";
import {Computer} from "@/app/types/Smartlist";

const HostCharts: React.FC<{ hostData: Computer[], hostLoading: boolean }> = ({
                                                                                  hostData,
                                                                                  hostLoading
                                                                              }) => {
    return (
        <>
            <SiteCharts/>
            <HostOSAreaChart hostData={hostData} hostLoading={hostLoading}/>
            <HostManufacturerAreaChart hostData={hostData} hostLoading={hostLoading}/>
        </>
    )
}

export default React.memo(HostCharts);