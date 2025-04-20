import React, {createContext, useContext, useEffect, useMemo, useState} from "react";
import {AuthContext} from "@/app/context/AuthProvider";
import { getVMs, getHosts } from "@/app/utils/api/Computer";
import { Computer } from "@/app/types/Smartlist";

type DashboardDataContextType = {
    vmData: Computer[] | null;
    hostData: Computer[] | null;
    loading: boolean;
    error: Error | null;
};

const DashboardDataContext = createContext<DashboardDataContextType | null>(null);

export const DashboardDataProvider = ({ children }: { children: React.ReactNode }) => {
    const [vmData, setVmData] = useState<Computer[] | null>(null);
    const [hostData, setHostData] = useState<Computer[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const authCtx = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            if (!authCtx?.isLoggedIn || !authCtx?.token) {
                setError(new Error("Authentication context is missing"));
                setLoading(false);
                return;
            }
            try {
                console.log('fetching dashboard data')
                const [ vmData, hostData] = await Promise.all([
                    getVMs(authCtx),
                    getHosts(authCtx),
                ]);

                setVmData(vmData);
                setHostData(hostData);
                setError(null)
            } catch (error) {
                setError(error instanceof Error ? error : new Error("Unknown error"));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [authCtx]);

    const contextValue = useMemo(() => ({
        vmData,
        hostData,
        loading,
        error,
    }), [vmData, hostData, loading, error]);


    return (
        <DashboardDataContext.Provider value={contextValue}>
            {children}
        </DashboardDataContext.Provider>
    );
};

export const useDashboardData = () => {
    const context = useContext(DashboardDataContext);
    if (!context) {
        throw new Error("useDashboardData must be used within a DashboardDataProvider");
    }
    return context;
};