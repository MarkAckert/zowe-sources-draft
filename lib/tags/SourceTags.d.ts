import { RepoTagMap } from "./RepoTagMap";
export declare class SourceTags {
    /**
     *  For now, just read the rules/source_tags.json and pass back that object.
     *
     *  Later on, should we consider parsing manifest files and querying GIT for matching tags?
     */
    static getRepositoriesWithTagsObject(): RepoTagMap;
    private static readonly STATIC_TAGS_FILE;
    private static getRepositoryTags;
    private static tryParseJSON;
}
