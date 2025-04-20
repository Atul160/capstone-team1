import {AuthContextType} from "@/app/context/AuthProvider";
import {message} from "antd";
import {Country, Site, SiteData,ComputeCluster,Computer,OperatingSystem,ClusterManager,Contact,Apm} from "@/app/types/Smartlist";
import {smartListQuery} from "@/app/utils/api/SmartlistQuery";

export const LoadCountrySites = async (authCtx: AuthContextType, countryId: number): Promise<Site[]> => {
    const authHeader = `${authCtx.tokenType} ${authCtx.token}`;
    return await smartListQuery(authHeader, 'sites', [`Site.CountryID==${countryId}`, 'Site.VerificationStatus==Verified'], ['Country']);
}

export const LoadCountries = async (authCtx: AuthContextType): Promise<Country[]> => {
    const authHeader = `${authCtx.tokenType} ${authCtx.token}`;
    return await smartListQuery(authHeader, 'countries');

}

export const getSiteData = async (authCtx: AuthContextType, siteId: number): Promise<Site> => {
    try {
        const authHeader = `${authCtx.tokenType} ${authCtx.token}`;
        return (await smartListQuery(authHeader, 'sites', [`Site.id==${siteId}`], ['ComputeClusters', 'ComputeClusters.Management', 'Computers', 'Networks']))[0];
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching site';
        message.error(`getSiteData: ${errorMessage}`);
        throw new Error(errorMessage);
    }
};

const siteProperties = async (sites: Site[], type: 'DC' | 'Store'): Promise<SiteData[]> => {
    const formatLocationNumber = (num: number): string => num.toString().padStart(5, '0');
    const seenSiteCodes = new Set<string>();
    const siteData: SiteData[] = [];

    for (const site of sites) {
        const countryCode = site.country?.code ?? 'XX';
        const countryName = site.country?.name ?? 'Unknown';
        const businessUnit = site.business_unit ?? '';

        const addSiteData = (locationNumber: number) => {
            const siteCode = `${countryCode}${formatLocationNumber(locationNumber)}`;
            if (!seenSiteCodes.has(siteCode)) {
                siteData.push({
                    siteId: site.id,
                    siteCode,
                    siteName: site.name,
                    cc: countryCode,
                    countryName,
                    locationNumber,
                    type: site.type,
                    edgeType: type,
                    businessUnit,
                });
                seenSiteCodes.add(siteCode);
            }
        };

        addSiteData(site.parent_location_number);
        if (site.is_colocated && site.location_number !== site.parent_location_number) {
            addSiteData(site.location_number);
        }
    }

    return siteData;
};

export const getAllSites = async (authCtx: AuthContextType): Promise<SiteData[]> => {
    try {
        const authHeader = `${authCtx.tokenType} ${authCtx.token}`;

        const [dcSites, storeSites] = await Promise.all([
            smartListQuery(authHeader, 'sites', ['Tag.name==Area', 'Tag.value==DC'], ['Country']),
            smartListQuery(authHeader, 'sites', ['Tag.name==Area', 'Tag.value==Store'], ['Country']),
        ]);

        const dcData = await siteProperties(dcSites, 'DC');
        const storeData = await siteProperties(storeSites, 'Store');

        const allSiteData = [...dcData, ...storeData];
        const uniqueSiteData = Array.from(new Map(allSiteData.map(site => [site.siteCode, site])).values());

        return uniqueSiteData.sort((a, b) => {
            const numDiff = a.locationNumber - b.locationNumber;
            return numDiff !== 0 ? numDiff : a.siteCode.localeCompare(b.siteCode);
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching sites';
        message.error(`getAllSites: ${errorMessage}`);
        throw new Error(errorMessage);
    }
};

export const getSites = async (authCtx: AuthContextType): Promise<Record<string, string>[]> => {
    try {
        const authHeader = `${authCtx.tokenType} ${authCtx.token}`;

        const siteslist: Site[] = await smartListQuery(authHeader, 'sites', [], ['Country']);

        const uniqueSiteData = Array.from(new Map(siteslist.map(site => [site.location_number, site])).values());

        
        const sites: Record<string, string>[] = uniqueSiteData.map(siteData => ({
            id: String(siteData.id) || 'NA',
            created_at: String(siteData.created_at) || 'NA',
            updated_at: String(siteData.updated_at) || 'NA',
            deleted_at: String(siteData.deleted_at) || 'NA',
            name: siteData.name || 'NA',
            //country_id: siteData.country_id || 'NA',
            country: siteData.country ? siteData.country.code : 'Unknown Country',
            environment: siteData.environment || 'NA',
            status: siteData.status || 'NA',
            patch_status: siteData.patch_status || 'NA',
            type: siteData.type || 'NA',
            ingest_type: siteData.ingest_type || 'NA',
            verification_status: siteData.verification_status || 'NA',
            location_number: String(siteData.location_number) || 'NA',
            parent_location_number: String(siteData.parent_location_number) || 'NA',
            is_colocated: siteData.is_colocated ? "true" : "false", 
            timezone: siteData.timezone || 'NA',
            //site_proxy: siteData.site_proxy || 'NA',
            last_patch_date: String(siteData.last_patch_date) || 'NA',
            business_unit: siteData.business_unit || 'NA',
            decommission_date: String(siteData.decommission_date) || 'NA',
            synced_at: String(siteData.synced_at) || 'NA',
        }));

       
        return sites.sort((a, b) => {
            const numDiff = parseInt(a.location_number, 10) - parseInt(b.location_number, 10);
            return numDiff !== 0 ? numDiff : a.name.localeCompare(b.name);
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching sites';
        message.error(`getSites: ${errorMessage}`);
        throw new Error(errorMessage);
    }
};


export const getClusters = async (authCtx: AuthContextType): Promise<Record<string, string>[]> => {
    try {
        const authHeader = `${authCtx.tokenType} ${authCtx.token}`;

        const compute_clusterslist: ComputeCluster[] = await smartListQuery(authHeader, 'compute_clusters', [], ['Management']);

        const uniqueClusterData = Array.from(new Map(compute_clusterslist.map(cluster => [cluster.name, cluster])).values());

        
        const compute_clusters: Record<string, string>[] = uniqueClusterData.map(clusterData => ({
            id: String(clusterData.id) || 'NA',
            created_at: String(clusterData.created_at) || 'NA',
            updated_at: String(clusterData.updated_at) || 'NA',
            deleted_at: String(clusterData.deleted_at) || 'NA',
            name: clusterData.name || 'NA',
            type: String(clusterData.type) || 'NA',
            vip: clusterData.vip || 'NA',
            cluster_manager_id: String(clusterData.cluster_manager_id) || 'NA',
            status: clusterData.status || 'NA',       
            management: clusterData.management?.name || 'NA',
            datacenter: clusterData.datacenter || 'NA',
            hypervisor: clusterData.hypervisor || 'NA',
            decommission_date: String(clusterData.decommission_date) || 'NA',
            synced_at: String(clusterData.synced_at) || 'NA',
        }));

       
        return compute_clusters.sort((a, b) => {
            const numDiff = parseInt(a.cluster_manager_id, 10) - parseInt(b.cluster_manager_id, 10);
            return numDiff !== 0 ? numDiff : a.name.localeCompare(b.name);
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching sites';
        message.error(`getClusters: ${errorMessage}`);
        throw new Error(errorMessage);
    }
};



export const getComputers = async (authCtx: AuthContextType): Promise<Record<string, string>[]> => {
    try {
        const authHeader = `${authCtx.tokenType} ${authCtx.token}`;

        const computer_list: Computer[] = await smartListQuery(authHeader, 'computers', [], ['OperatingSystem']);

        const uniqueClusterData = Array.from(new Map(computer_list.map(computer => [computer.name, computer])).values());

        
        const computers: Record<string, any>[] = uniqueClusterData.map(computerData => ({
          
                id: String(computerData.id) || 'NA',
                created_at: String(computerData.created_at) || 'NA',
                updated_at: String(computerData.updated_at) || 'NA',
                deleted_at: String(computerData.deleted_at) || 'NA',
                name: computerData.name || 'NA',
                type: computerData.type || 'NA',
                system_type: computerData.system_type || 'NA',
                cpu_model: computerData.cpu_model || 'NA',
                sockets: String(computerData.sockets) || 'NA',
                cores_per_socket: String(computerData.cores_per_socket) || 'NA',
                memory_mib: String(computerData.memory_mib) || 'NA',
                manufacturer: computerData.manufacturer || 'NA',
                model: computerData.model || 'NA',
                serial_number: computerData.serial_number || 'NA',
                operating_system_id: String(computerData.operating_system_id) || 'NA',
                operating_system: computerData.operating_system?.name || 'NA',
                kernel_version: computerData.kernel_version || 'NA',
                ipmi_address: computerData.ipmi_address || 'NA',
                uuid: computerData.uuid || 'NA',
                build_session_id: String(computerData.build_session_id) || 'NA',
                computer_id: String(computerData.computer_id) || 'NA',
                site_id: String(computerData.site_id) || 'NA',
                status: computerData.status || 'NA',
                patch_status: computerData.patch_status || 'NA',
                last_patch_date: String(computerData.last_patch_date) || 'NA',
                puppet_env: computerData.puppet_env || 'NA',
                virtual_networks: computerData.virtual_networks || 'NA',
                nics: computerData.nics || 'NA',
                storage: computerData.storage || 'NA',
                applications: computerData.applications || 'NA',
                built_date: String(computerData.built_date) || 'NA',
                built_by: computerData.built_by || 'NA',
                decommission_date: String(computerData.decommission_date) || 'NA',
                computers: computerData.computers || 'NA',
                metadata: computerData.metadata || 'NA',
                tags: computerData.tags || 'NA',
                synced_at: String(computerData.synced_at) || 'NA',

        }));

       
        return computers.sort((a, b) => {
            const numDiff = parseInt(a.cluster_manager_id, 10) - parseInt(b.cluster_manager_id, 10);
            return numDiff !== 0 ? numDiff : a.name.localeCompare(b.name);
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching sites';
        message.error(`getComputers: ${errorMessage}`);
        throw new Error(errorMessage);
    }
};


export const getOperatingSystems = async (authCtx: AuthContextType): Promise<Record<string, string>[]> => {
    try {
        const authHeader = `${authCtx.tokenType} ${authCtx.token}`;

        const compute_OperatingSystemlist: OperatingSystem[] = await smartListQuery(authHeader, 'operating_systems', [], []);

        const uniqueOperatingSystemData = Array.from(new Map(compute_OperatingSystemlist.map(OperatingSystem => [OperatingSystem.name, OperatingSystem])).values());

        
        const compute_OperatingSystem: Record<string, string>[] = uniqueOperatingSystemData.map(OperatingSystemData => ({
            id: String(OperatingSystemData.id) || 'NA',
            created_at: String(OperatingSystemData.created_at) || 'NA',
            updated_at: String(OperatingSystemData.updated_at) || 'NA',
            deleted_at: String(OperatingSystemData.deleted_at) || 'NA',
            name: OperatingSystemData.name || 'NA',
            family: OperatingSystemData.family || 'NA',
            version: OperatingSystemData.version || 'NA',
            kernel_version: OperatingSystemData.kernel_version || 'NA',
        }));

       
        return compute_OperatingSystem.sort((a, b) => {
            const numDiff = parseInt(a.cluster_manager_id, 10) - parseInt(b.cluster_manager_id, 10);
            return numDiff !== 0 ? numDiff : a.name.localeCompare(b.name);
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching sites';
        message.error(`getOperatingSystems: ${errorMessage}`);
        throw new Error(errorMessage);
    }
};




export const getCountries = async (authCtx: AuthContextType): Promise<Record<string, string>[]> => {
    try {
        const authHeader = `${authCtx.tokenType} ${authCtx.token}`;

        const compute_Countrylist: Country[] = await smartListQuery(authHeader, 'countries', [], []);

        const uniqueCountryData = Array.from(new Map(compute_Countrylist.map(Country => [Country.name, Country])).values());

        
        const compute_Country: Record<string, string>[] = uniqueCountryData.map(CountryData => ({
            id: String(CountryData.id) || 'NA',
            created_at: String(CountryData.created_at) || 'NA',
            updated_at: String(CountryData.updated_at) || 'NA',
            deleted_at: String(CountryData.deleted_at) || 'NA',
            code: CountryData.code || 'NA',
            name: CountryData.name || 'NA',
        }));

       
        return compute_Country.sort((a, b) => {
            const numDiff = parseInt(a.cluster_manager_id, 10) - parseInt(b.cluster_manager_id, 10);
            return numDiff !== 0 ? numDiff : a.name.localeCompare(b.name);
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching sites';
        message.error(`getCountries: ${errorMessage}`);
        throw new Error(errorMessage);
    }
};



export const getClusterManagers = async (authCtx: AuthContextType): Promise<Record<string, string>[]> => {
    try {
        const authHeader = `${authCtx.tokenType} ${authCtx.token}`;

        const compute_ClusterManagerlist: ClusterManager[] = await smartListQuery(authHeader, 'cluster_management', [''], ['Country']);

        const uniqueClusterManagerData = Array.from(new Map(compute_ClusterManagerlist.map(ClusterManager => [ClusterManager.name, ClusterManager])).values());

        
        const compute_ClusterManager: Record<string, string>[] = uniqueClusterManagerData.map(ClusterManagerData => ({
                id: String(ClusterManagerData.id) || 'NA',
               created_at: String(ClusterManagerData.created_at) || 'NA',
               updated_at: String(ClusterManagerData.updated_at) || 'NA',
               deleted_at: String(ClusterManagerData.deleted_at) || 'NA',
               name: ClusterManagerData.name || 'NA',
               ip_address: ClusterManagerData.ip_address || 'NA',
               country_id: String(ClusterManagerData.country_id) || 'NA',
               country: ClusterManagerData.country.name || 'NA',
               hypervisor: ClusterManagerData.hypervisor || 'NA',
               build_version: ClusterManagerData.build_version || 'NA',
               status: ClusterManagerData.status || 'NA',
               environment: ClusterManagerData.environment || 'NA',
               contacts: String(ClusterManagerData.contacts) || 'NA',
               decommission_date: String(ClusterManagerData.decommission_date) || 'NA',
        }));

       
        return compute_ClusterManager.sort((a, b) => {
            const numDiff = parseInt(a.cluster_manager_id, 10) - parseInt(b.cluster_manager_id, 10);
            return numDiff !== 0 ? numDiff : a.name.localeCompare(b.name);
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching sites';
        message.error(`getClusterManagers: ${errorMessage}`);
        throw new Error(errorMessage);
    }
};


export const getContacts = async (authCtx: AuthContextType): Promise<Record<string, string>[]> => {
    try {
        const authHeader = `${authCtx.tokenType} ${authCtx.token}`;

        const compute_Contactlist: Contact[] = await smartListQuery(authHeader, 'contacts', [''], ['']);

        const uniqueContactData = Array.from(new Map(compute_Contactlist.map(Contact => [Contact.name, Contact])).values());

        
        const compute_Contact: Record<string, string>[] = uniqueContactData.map(ContactData => ({
            id: String(ContactData.id) || 'NA',
            type: ContactData.type || 'NA',
            name: ContactData.name || 'NA',
            email: ContactData.email || 'NA',
            phone: ContactData.phone || 'NA',
        }));

       
        return compute_Contact.sort((a, b) => {
            const numDiff = parseInt(a.cluster_manager_id, 10) - parseInt(b.cluster_manager_id, 10);
            return numDiff !== 0 ? numDiff : a.name.localeCompare(b.name);
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching sites';
        message.error(`getContacts: ${errorMessage}`);
        throw new Error(errorMessage);
    }
};



export const getApms = async (authCtx: AuthContextType): Promise<Record<string, string>[]> => {
    try {
        const authHeader = `${authCtx.tokenType} ${authCtx.token}`;

        const compute_Apmlist: Apm[] = await smartListQuery(authHeader, 'apm', [''], ['*']);

        const uniqueApmData = Array.from(new Map(compute_Apmlist.map(Apm => [Apm.name, Apm])).values());

        
        const compute_Apm: Record<string, string>[] = uniqueApmData.map(ApmData => ({
                id: String(ApmData.id) || "NA",
                name: ApmData.name || "NA",
                alias: ApmData.alias || "NA",
                install_type: ApmData.install_type || "NA",
                active: ApmData.active ? "Yes" : "No", 
                owner: ApmData.owner || "NA",
                support_group: ApmData.support_group || "NA",
                ssp_id: String(ApmData.ssp_id) || "NA",
                team_rosters_product_id: String(ApmData.team_rosters_product_id) || "NA",
                contacts: Array.isArray(ApmData.contacts) ? JSON.stringify(ApmData.contacts) : ApmData.contacts || "NA",
        }));

       
        return compute_Apm.sort((a, b) => {
            const numDiff = parseInt(a.cluster_manager_id, 10) - parseInt(b.cluster_manager_id, 10);
            return numDiff !== 0 ? numDiff : a.name.localeCompare(b.name);
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching sites';
        message.error(`getApms: ${errorMessage}`);
        throw new Error(errorMessage);
    }
};

