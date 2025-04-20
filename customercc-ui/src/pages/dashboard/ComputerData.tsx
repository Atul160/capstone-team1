import {AuthContextType} from "@/app/context/AuthProvider";
import {getHosts, getVMs} from "@/app/utils/api/Computer";
import {useCallback, useEffect, useState} from "react";
import {Computer} from "@/app/types/Smartlist";

export const useHostData = (authCtx: AuthContextType) => {
    const [hostData, setHostData] = useState<Computer[]>([]);
    const [hostLoading, setHostLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!authCtx?.isLoggedIn || !authCtx?.token) {
            setError(new Error("Authentication context is missing"));
            return;
        }
        setHostLoading(true);
        try {
            const data = await getHosts(authCtx); // Abstracted API call
            setHostData(data);
        } catch (error) {
            setError(error instanceof Error ? error : new Error(`Error fetching Host data: ${error}`));
        } finally {
            setHostLoading(false);
        }
    }, [authCtx]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 2 * 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchData]);

    return {hostData, hostLoading, error};
};

export const useVMData = (authCtx: AuthContextType) => {
    const [vmData, setVMData] = useState<Computer[]>([]);
    const [vmLoading, setVMLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!authCtx?.isLoggedIn || !authCtx?.token) {
            setError(new Error("Authentication context is missing"));
            return;
        }
        setVMLoading(true);
        try {
            const data = await getVMs(authCtx); // Abstracted API call
            // const filteredData = await getVMsFiltered(authCtx)
            // console.log(filteredData)

            setVMData(data);
        } catch (error) {
            setError(error instanceof Error ? error : new Error(`Error fetching VM data: ${error}`));
        } finally {
            setVMLoading(false);
        }
    }, [authCtx]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 2 * 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchData]);

    return {vmData, vmLoading, error};
};

export const useCombinedData = (authCtx: AuthContextType) => {
    const [hostData, setHostData] = useState<Computer[]>([]);
    const [vmData, setVmData] = useState<Computer[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isActive = true;
        setLoading(true);

        Promise.all([
            getHosts(authCtx),
            getVMs(authCtx)
        ])
            .then(([hosts, vms]) => {
                if (isActive) {
                    setHostData(hosts);
                    setVmData(vms);
                }
            })
            .finally(() => {
                if (isActive) {
                    setLoading(false);
                }
            });

        return () => {
            isActive = false;
        };
    }, [authCtx]);

    return {hostData, vmData, loading};
}

