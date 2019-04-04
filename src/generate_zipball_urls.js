// Make clone area
const fs = require('fs');
const async = require('async');
const spawn = require('cross-spawn')
const isNullOrUndefined = require('util').isNullOrUndefined;
// Simple API for grabbing all repos in the org.
// Design change means we whitelist repos instead of blacklist; should refactor
const Octokit = require('@octokit/rest')
const octokit = new Octokit();
/*
octokit.hook.before('request', async (options) => {
    console.log(options)
})
octokit.hook.after('request', async (response, options) => {
    console.log(`${options.method} ${options.url}: ${response.status}`)
})
octokit.hook.error('request', async (error, options) => {
    throw error
})
*/
// Git clone is pretty inexpensive
const PARALLEL_CLONE_COUNT = 4;

const whitelistRepos = fs.readFileSync("rules/repoList.txt", 'utf-8').split(/\r\n|\r|\n/g);
const tagMap = JSON.parse(fs.readFileSync("rules/source_tags.json", 'utf-8'));
const zipballMap = {};
const releaseMap = [];
whitelistRepos.forEach((repo) => {
    releaseMap[repo] = [];
    zipballMap[repo] = "";
    if (isNullOrUndefined(tagMap[repo])){
        throw new Error("Repository " + repo + " is missing a tag");
    }
});
const getReleasesFn = async function (repository) {
    await octokit.repos.listTags({
        owner: 'zowe',
        repo: repository,
        per_page: 999,
        userAgent: 'octoki/rest.js 16.13.1',
        headers: { 'Authorization' : 'Basic ***REMOVED***' }
    }).then((data, status, headers) => {
         // console.log(data);
         for (var i = 0; i < data["data"].length; i++) {
            const entry = data["data"][i];
            if (entry["name"] === tagMap[repository]){
                zipballMap[repository] = entry["zipball_url"]
                return;
            }
          //  console.log("ENTRY\n\n\n" + entry);
        }
    }).catch((error) => {
        console.log("Error for repository " + repository);
        throw new Error("Error getting zipball url for " + repository + ".\n" + error);
    });
}


var listReleaseQ = async.queue(getReleasesFn, 1);

listReleaseQ.drain = function () {
    console.log("Completed all clones.")

    console.log(releaseMap);
}

const gitPromise = [];
whitelistRepos.forEach((aRepo) => {
    gitPromise.push(getReleasesFn(aRepo));
});
Promise.all(gitPromise).then((data) => {
    fs.writeFileSync("output/zipball_map.json", JSON.stringify(zipballMap), 'utf-8');
});
