"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Octokit = require("@octokit/rest");
const util_1 = require("util");
const fs = require("fs");
const url_1 = require("url");
class GithubApis {
    static getZipballUrl(repository, tTag) {
        return new Promise((resolve, reject) => {
            GithubApis.apiClient.repos.getReleaseByTag({ owner: "zowe", repo: repository, tag: tTag }).then((response) => {
                if (!util_1.isNullOrUndefined(response.data)) {
                    resolve(new url_1.URL(response.data.zipball_url));
                }
                else {
                    reject("Data does not exist on the response for " + repository + ":" + tTag);
                }
            }).catch((rejected) => {
                reject(rejected);
                throw new Error(rejected);
            });
        });
    }
}
GithubApis.API_TOKEN = fs.readFileSync("resources/github_token.txt").toString();
GithubApis.apiClient = new Octokit({
    auth: `token ${GithubApis.API_TOKEN}`
});
exports.GithubApis = GithubApis;
//# sourceMappingURL=GithubApis.js.map