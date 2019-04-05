"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path_1 = require("path");
const GithubApis_1 = require("../github/GithubApis");
class SourceTags {
    /**
     *  For now, just read the rules/source_tags.json and pass back that object.
     *
     *  Later on, should we consider parsing manifest files and querying GIT for matching tags?
     */
    static getRepositoriesWithTagsObject() {
        const repositoryWithTag = this.getRepositoryTags();
        const repoWithZipball = {};
        Object.keys(repositoryWithTag).forEach((repoName) => {
            GithubApis_1.GithubApis.getZipballUrl(repoName, repositoryWithTag[repoName]).then((zipballUrl) => {
                repoWithZipball[repoName] = zipballUrl;
            });
        });
        return repoWithZipball;
    }
    static getRepositoryTags() {
        return this.tryParseJSON(fs.readFileSync(this.STATIC_TAGS_FILE).toString());
    }
    // From Stackoverflow
    static tryParseJSON(jsonString) {
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
SourceTags.STATIC_TAGS_FILE = "rules" + path_1.sep + "source_tags.json";
exports.SourceTags = SourceTags;
//# sourceMappingURL=SourceTags.js.map