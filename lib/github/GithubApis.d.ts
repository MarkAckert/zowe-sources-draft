/// <reference types="node" />
import { URL } from "url";
export declare class GithubApis {
    static getZipballUrl(repository: string, tTag: string): Promise<URL>;
    private static API_TOKEN;
    private static apiClient;
}
