import {SMARTLIST} from "@/app/utils/config";
import axios from "axios";
import qs from "qs";
import {message} from "antd";

export async function smartListQuery(
    authHeader: string,
    route: string,
    queries?: string[],
    include?: string[]
) {
    try {
        const uri = new URL(`api/${route}`, SMARTLIST);
        const response = await axios({
            url: uri.toString(),
            params: {q: queries, inc: include},
            paramsSerializer: params => qs.stringify(params, {indices: false}),
            method: 'get',
            headers: {Authorization: authHeader}
        });
        return response.data.entities || response.data;
    } catch (error) {
        if (error instanceof Error) {
            message.error(`smartListQuery: ${error.message}`);
        }
        throw error;
    }
}