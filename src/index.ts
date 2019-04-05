import * as fs from "fs";
import { sep } from "path";
import { SourceTags } from "./tags/SourceTags";
import { RepoTagMap } from "./tags/RepoTagMap";
import * as download from "download";
import * as Zip from "adm-zip";
import * as rimraf from "rimraf";
import { isNullOrUndefined } from "util";

// tslint:disable
const OUTPUT_DIR = "output";
const OUTPUT_SOURCES = OUTPUT_DIR + sep + "sources";
const OUTPUT_ZIP = OUTPUT_DIR + sep + "zowe_sources.zip";
const README_FILE = "resources" + sep + "README.md";

if (fs.existsSync(OUTPUT_ZIP)){
    fs.unlinkSync(OUTPUT_ZIP);
}

if (fs.existsSync(OUTPUT_SOURCES)) {
    rimraf.sync(OUTPUT_SOURCES);
}

fs.mkdirSync(OUTPUT_SOURCES);

SourceTags.getRepositoriesWithTagsObject().then((repoZipBallUrls: RepoTagMap) => {
    Promise.all(Object.values(repoZipBallUrls).map((zipUrl) => download(zipUrl.toString(), OUTPUT_SOURCES))).then((result) => {
        const sourcesZip: Zip = new Zip();
        fs.readdirSync(OUTPUT_SOURCES).forEach((zipFile) => {
            sourcesZip.addLocalFile(OUTPUT_SOURCES + sep + zipFile);
        });
        sourcesZip.addLocalFile(README_FILE);
        sourcesZip.writeZip(OUTPUT_ZIP, (error) => {
            if (!isNullOrUndefined(error)){ 
                console.log(error);
                throw new Error("Error during zip write : " + error);
            } 
        });
        console.log("ZIP Write Complete, available here: " + OUTPUT_ZIP);
    });
});

