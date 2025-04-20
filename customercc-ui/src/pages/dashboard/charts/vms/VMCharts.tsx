import React from "react";
import VMOSChart from "@/app/components/content/dashboard/charts/vms/VMOSData";
import VMStatusChart from "@/app/components/content/dashboard/charts/vms/VMStatusData";
import {Computer} from "@/app/types/Smartlist";

const VMCharts: React.FC<{ vmData: Computer[], vmLoading: boolean }> = ({
                                                                            vmData,
                                                                            vmLoading
                                                                        }) => {
    return (
        <>
            <VMOSChart vmData={vmData} vmLoading={vmLoading}/>
            <VMStatusChart vmData={vmData} vmLoading={vmLoading}/>
        </>
    );
}

export default VMCharts;