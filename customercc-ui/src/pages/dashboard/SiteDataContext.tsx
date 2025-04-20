import {createContext, useCallback, useContext, useEffect, useState} from "react";
import {SiteData} from "@/app/types/Smartlist";
import {getAllSites} from "@/app/utils/api/Site";
import {AuthContext} from "@/app/context/AuthProvider";

interface SiteDataContextType {
    siteData: SiteData[] | null;
    error: Error | null;
    refetch: () => void;
}

interface SiteDataProviderProps {
    children: React.ReactNode;
}

const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined);

export const SiteDataProvider = ({ children }: SiteDataProviderProps) => {
    const [siteData, setSiteData] = useState<SiteData[] | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const authCtx = useContext(AuthContext);

    const fetchSiteData = useCallback(async () => {
        if (!authCtx?.isLoggedIn || !authCtx?.token) {
            setSiteData(null);
            setError(new Error("Authentication context is missing"));
            return;
        }
        try {
            setError(null);
            const data = await getAllSites(authCtx);
            setSiteData(data ?? null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Unknown error"));
            setSiteData(null);
        }
    }, [authCtx.isActive]);

    useEffect(() => {
        if (authCtx?.isLoggedIn) {
            fetchSiteData(); // Initial fetch
            const interval = setInterval(fetchSiteData, 4 * 60 * 60 * 1000); // 4-hour interval

            return () => clearInterval(interval);
        } else {
            setSiteData(null);
            setError(null);
        }
    }, [authCtx?.isLoggedIn, fetchSiteData]);

    return (
        <SiteDataContext.Provider value={{ siteData, error, refetch: fetchSiteData }}>
            {children}
        </SiteDataContext.Provider>
    );
};

export const useSiteData = () => {
    const context = useContext(SiteDataContext);
    if (!context) {
        throw new Error("useSiteData must be used within a SiteDataProvider");
    }
    return context;
};