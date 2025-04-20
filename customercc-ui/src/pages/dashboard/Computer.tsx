import {AuthContextType} from "@/app/context/AuthProvider";
import {message} from "antd";
import {Computer} from "@/app/types/Smartlist";
import {smartListQuery} from "./SmartlistQuery";

export const getHosts = async (authCtx: AuthContextType): Promise<Computer[]> => {
    try {
        const authHeader = `${authCtx.tokenType} ${authCtx.token}`;
        return await smartListQuery(authHeader, 'computers', ['Computer.type==VirtualHost'], ['OperatingSystem', 'Tags'])
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching hosts';
        message.error(`getHosts: ${errorMessage}`);
        throw new Error(errorMessage);
    }
}

export const getVMs = async (authCtx: AuthContextType): Promise<Computer[]> => {
    try {
        const authHeader = `${authCtx.tokenType} ${authCtx.token}`;
        return await smartListQuery(authHeader, 'computers', ['Computer.type==VirtualMachine'], ['OperatingSystem', 'Tags'])
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching VMs';
        message.error(`getVMs: ${errorMessage}`);
        throw new Error(errorMessage);
    }
}

export const getVMsFiltered = async (authCtx: AuthContextType): Promise<Computer[]> => {
    try {
        const authHeader = `${authCtx.tokenType} ${authCtx.token}`;
        // const http = require("https");

        const options = {
            "method": "POST",
            "hostname": "dc-console.lab.wal-mart.com",
            "port": null,
            "path": "/slgo/api/reports",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": authHeader
            }
        };

        return new Promise<Computer[]>((resolve, reject) => {
            const req = http.request(options, (res) => {
                const chunks: Buffer[] = [];

                res.on("data", (chunk) => {
                    chunks.push(chunk);
                });

                res.on("end", () => {
                    const body = Buffer.concat(chunks).toString();
                    // console.log(body);
                    // Assuming the response body contains the required data
                    const computers: Computer[] = JSON.parse(body).entities;
                    resolve(computers);
                });
            });

            req.on("error", (error) => {
                const errorMessage = error ? error.message : 'Unknown error fetching VMs';
                message.error(`getVMsFiltered: ${errorMessage}`);
                reject(new Error(errorMessage));
            });

            req.write(JSON.stringify({
                entity_type: 'Computer',
                columns: [
                    {type: 'Computer', column: 'name', as_name: 'Name', group: true},
                    {type: 'Computer', column: 'status', as_name: 'Status', group: false},
                    {type: 'Site', column: 'location_number', as_name: 'Location', group: true},
                    {type: 'Country', column: 'code', as_name: 'Country', group: true},
                    {type: 'OperatingSystem', column: 'name', as_name: 'OS', group: false},
                    {type: 'OperatingSystem', column: 'family', as_name: 'Family', group: true}
                ],
                filter: 'Computer.type==VirtualMachine',
                page: 0,
                per_page: 0,
                distinct: true,
                sort_by: [
                    // {column: 'Site.location_number', direction: 'ASC'},
                    // {column: 'Country.code', direction: 'ASC'},
                    // {column: 'Computer.name', direction: 'ASC'}
                ]
            }));
            req.end();
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching VMs';
        message.error(`getVMs: ${errorMessage}`);
        throw new Error(errorMessage);
    }
}

