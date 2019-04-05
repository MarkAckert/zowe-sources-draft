import * as Octokit from "@octokit/rest";
import * as async from "async";
import { isNullOrUndefined } from "util";

import * as fs from "fs";
import { URL } from "url";

export class GithubApis {

    public static getZipballUrl(repository: string, tTag: string): Promise<URL> {
        return new Promise<URL>((resolve, reject) => {
            GithubApis.apiClient.repos.getReleaseByTag({ owner: "zowe", repo: repository, tag: tTag }).then((response) => {
                if (!isNullOrUndefined(response.data)){
                    resolve(new URL(response.data.zipball_url));
                }
                else {
                    reject("Data does not exist on the response for " + repository + ":" + tTag);
                }
            }).catch((rejected: any) => {
                reject(rejected);
                throw new Error(rejected);
            });
        });
    }

    private static API_TOKEN = fs.readFileSync("resources/github_token.txt").toString();
    private static apiClient: Octokit = new Octokit({
        auth: `token ${GithubApis.API_TOKEN}`
    });

}
