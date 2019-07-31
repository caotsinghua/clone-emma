import React, { useContext } from 'react';
import algoliasearch, { Response } from 'algoliasearch';

const algoliaConfig = {
  appId: 'OFCNCOG2CU',
  apiKey: '6fe4476ee5a1832882e326b506d14126',
  indexName: 'npm-search'
};

const client = algoliasearch(algoliaConfig.appId, algoliaConfig.apiKey).initIndex(algoliaConfig.indexName);

// package

export interface IPackage {
  objectID: string;
  name: string;
  version: string;
  description: string;
  repository?: IPackageRepository;
  owner: IPackageOwner;
  humanDownloadsLast30Days: string;
}

export interface IPackageRepository {
  url: string;
}

export interface IPackageOwner {
  name: string;
  email?: string;
  avatar: string;
  link: string;
}

export const search = (query: string, page: number = 0): Promise<Response<IPackage>> => {
  return client.search({
    query,
    attributesToRetrieve: ['name', 'version', 'description', 'owner', 'repository', 'humanDownloadsLast30Days'],
    page,
    hitsPerPage: 10
  });
};

// context
export type WithSearchContext<X> = X & { hits: IPackage[] }; // 交叉类型

export const SearchContext = React.createContext<IPackage[]>([]);
