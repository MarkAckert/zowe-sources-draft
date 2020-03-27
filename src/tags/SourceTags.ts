import * as fs from "fs";
import { sep } from "path";
import { RepoTagMap } from "./RepoTagMap";
import { GithubApis } from "../github/GithubApis";
import { URL } from "url";
import * as download from "download";

export class SourceTags {

    /**
     *  For now, just read the rules/source_tags.json and pass back that object.
     *
     *  Later on, should we consider parsing manifest files and querying GIT for matching tags?
     */
    public static getRepositoriesWithTagsObject(): Promise<RepoTagMap> {
        return new Promise<RepoTagMap>((resolve, reject) => {
            this.getRepositoryTagsFromManifest()
                .then((repositoryWithTag) => {
                    const repoWithZipball: RepoTagMap = {};
                    const zipballPromises: Array<Promise<any>> = [];
                    Object.keys(repositoryWithTag).forEach((repoName) => {
                        const zipPromise = GithubApis.getZipballUrl(repoName, repositoryWithTag[repoName]);
                        zipballPromises.push(zipPromise);
                        zipPromise.then((zipballUrl: URL) => {
                            repoWithZipball[repoName] = zipballUrl;
                        }).catch((error) => {
                            console.log(error);
                        });
                    });
                    Promise.all(zipballPromises).then((result) => {
                        // ignore result
                        resolve(repoWithZipball);
                    }).catch((error) => {
                        reject(error);
                    });
                });
        });
    }

    private static readonly STATIC_TAGS_MANIFEST_URL: string =
        "https://raw.githubusercontent.com/zowe/zowe-install-packaging/rc/manifest.json.template";

    private static getRepositoryTagsFromManifest(): Promise<{ [key: string]: string }> {
        const manifestUrl: string = process.env.ZOWE_MANIFEST_URL || this.STATIC_TAGS_MANIFEST_URL;
        console.log(`Fetching ${manifestUrl}...`);
        return new Promise<{ [key: string]: string }>((resolve, reject) => {
            download(manifestUrl).then((data) => {
                const manifestObj = this.tryParseJSON(data.toString());
                if (!manifestObj || !manifestObj.sourceDependencies) {
                    reject(new Error("Failed to parse manifest file"));
                } else {
                    const repoTags: { [key: string]: string } = {};
                    for (const grp of manifestObj.sourceDependencies) {
                        for (const entry of grp.entries) {
                            repoTags[entry.repository] = entry.tag;
                        }
                    }

                    resolve(repoTags);
                }
            });
        });
    }

    // From Stackoverflow
    private static tryParseJSON(jsonString: string) {
        try {
            const o = JSON.parse(jsonString);

            // Handle non-exception-throwing cases:
            // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
            // but... JSON.parse(null) returns null, and typeof null === "object",
            // so we must check for that, too. Thankfully, null is falsey, so this suffices:
            if (o && typeof o === "object") {
                return o;
            }
        }
        catch (e) { // prevent bubble up]
        }
        return null;
    }
}
