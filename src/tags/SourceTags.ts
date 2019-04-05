import * as fs from "fs";
import { sep } from "path";
import { RepoTagMap } from "./RepoTagMap";
import { GithubApis } from "../github/GithubApis";
import { URL } from "url";

export class SourceTags {

    /**
     *  For now, just read the rules/source_tags.json and pass back that object.
     *
     *  Later on, should we consider parsing manifest files and querying GIT for matching tags?
     */
    public static getRepositoriesWithTagsObject(): Promise<RepoTagMap> {
        return new Promise<RepoTagMap>((resolve, reject) => {
            const repositoryWithTag = this.getRepositoryTags();
            const repoWithZipball: RepoTagMap = {};
            const zipballPromises: Array<Promise<any>> = [];
            Object.keys(repositoryWithTag).forEach((repoName) => {
                const zipPromise = GithubApis.getZipballUrl(repoName, repositoryWithTag[repoName]);
                zipballPromises.push(zipPromise);
                zipPromise.then((zipballUrl: URL) => {
                    repoWithZipball[repoName] = zipballUrl;
                });
            });
            Promise.all(zipballPromises).then((result) => {
                // ignore result
                resolve(repoWithZipball);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    private static readonly STATIC_TAGS_FILE: string = "rules" + sep + "source_tags.json";

    private static getRepositoryTags(): { [key: string]: string } {
        return this.tryParseJSON(fs.readFileSync(this.STATIC_TAGS_FILE).toString());
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
