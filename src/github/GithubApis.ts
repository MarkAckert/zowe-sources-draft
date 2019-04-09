import * as Octokit from "@octokit/rest";
import * as async from "async";
import { isNullOrUndefined } from "util";

import * as fs from "fs";
import { URL } from "url";
import { url } from "inspector";

export class GithubApis {

    public static getZipballUrl(repository: string, tTag: string): Promise<URL> {
        return new Promise<URL>((resolve, reject) => {
            console.log(repository + "  " + tTag);
            GithubApis.apiClient.paginate(`/repos/zowe/${repository}/tags`).then((response: Octokit.ReposListTagsResponse) => {
                if (!isNullOrUndefined(response) && response.length > 0) {
                    for (const tagResponse of response) {
                        if (tagResponse.name === tTag) {
                            resolve(new URL(tagResponse.zipball_url));
                        }
                    }
                    reject(`Tag ${tTag} not found within the repository '${repository}'.`);
                }
                else {
                    reject(`Received an empty response trying to list tags for the repository '${repository}'`);
                }
            }).catch((rejected: any) => {
                reject(rejected);
                throw new Error(rejected);
            });
        });
    }

    private static API_TOKEN = (!isNullOrUndefined(process.env.GITHUB_TOKEN
        && process.env.GITHUB_TOKEN.length > 0) ? process.env.GITHUB_TOKEN : fs.readFileSync("resources/github_token.txt").toString());
    private static apiClient: Octokit = new Octokit({
        auth: `token ${GithubApis.API_TOKEN}`
    });

}
