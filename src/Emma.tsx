import React, { useState, useEffect } from 'react';
import { Box, StdinContext } from 'ink';
import { WithStdin } from './utils';
import { IPackage, SearchContext, search } from './algolia';
import { IDependency } from './installer';
import { SearchWithStdin, ScrollWithStdin, PackageWithStdinAndHits } from './components/index';

const SPACE = ' ';
const ARROW_UP = '\u001B[A';
const ARROW_DOWN = '\u001B[B';
const ENTER = '\r';
const CTRL_C = '\x03';

enum VIEW {
  SEARCH = 'SEARCH',
  SCROLL = 'SCROLL',
  OVERVIEW = 'OVERVIEW',
  INSTALL = 'INSTALL'
}

const Emma: React.FC<WithStdin<{}>> = () => {
  const [view, setView] = useState<VIEW>(VIEW.SEARCH);
  const [query, setQuery] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [hits, setHits] = useState<IPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dependencies, setDependencies] = useState<{ [name: string]: IDependency }>();
  const [status, setStatus] = useState('NOT_STARTED');

  //   搜索
  const handleQueryChange = async (value?: string) => {
    if (value) {
      setQuery(query => `${query}${value}`);
    } else {
      setQuery(query => query.slice(0, query.length - 1));
    }

    setPage(0);
    setView(VIEW.SEARCH);
    setLoading(true);
    const res = await search(value);
    if (res.query === query) {
      setHits(res.hits);
      setLoading(false);
    }
  };

  const handleWillReachEnd = () => {
    console.log('will reach end');
  };

  const toggleDependency = (pkg: IPackage) => {
    console.log('toggle 依赖', pkg.name);
  };
  return (
    <SearchContext.Provider value={hits}>
      <Box flexDirection="column">
        <SearchWithStdin value={query} onChange={handleQueryChange} loading={loading} active />
        <ScrollWithStdin values={hits} onWillReachEnd={handleWillReachEnd} active={view === VIEW.SCROLL}>
          {pkg => (
            <PackageWithStdinAndHits
              key={pkg.objectId}
              pkg={pkg}
              onClick={toggleDependency}
              active={pkg.active}
              type={(dependencies[pkg.name] && dependencies[pkg.name].type) || undefined}
            />
          )}
        </ScrollWithStdin>
      </Box>
    </SearchContext.Provider>
  );
};

const EmmaWithStdin: React.FC = props => (
  <StdinContext.Consumer>
    {({ stdin, setRawMode }) => <Emma {...props} stdin={stdin} setRawMode={setRawMode} />}
  </StdinContext.Consumer>
);

export default EmmaWithStdin;
