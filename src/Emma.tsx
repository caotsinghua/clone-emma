import React, { useState, useEffect, useRef, useCallback, useMemo, useReducer } from 'react';
import { Box, StdinContext } from 'ink';
import { WithStdin } from './utils';
import { IPackage, SearchContext, search } from './algolia';
import { IDependency } from './installer';
import { SearchWithStdin, ScrollWithStdin, PackageWithStdinAndHits } from './components/index';
import { reducer, setQuery, setView } from './reducer';
const SPACE = ' ';
const ARROW_UP = '\u001B[A';
const ARROW_DOWN = '\u001B[B';
const ENTER = '\r';
const CTRL_C = '\x03';

export enum VIEW {
  SEARCH = 'SEARCH',
  SCROLL = 'SCROLL',
  OVERVIEW = 'OVERVIEW',
  INSTALL = 'INSTALL'
}

const Emma: React.FC<WithStdin<{}>> = ({ stdin, setRawMode }) => {
  const [state, dispatch] = useReducer(reducer, { query: '', view: VIEW.SEARCH });

  const [page, setPage] = useState<number>(0);
  const [hits, setHits] = useState<IPackage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dependencies, setDependencies] = useState<{ [name: string]: IDependency }>({});
  const [status, setStatus] = useState('NOT_STARTED');

  useEffect(() => {
    if (setRawMode) setRawMode(true);
    stdin.on('data', handleInput);
    return () => {
      stdin.removeListener('data', handleInput);
      if (setRawMode) setRawMode(false);
    };
  }, []);

  //   搜索
  const handleQueryChange = async (value: string) => {
    dispatch(setQuery(value));
    setPage(0);
    dispatch(setView(VIEW.SEARCH));
    setLoading(true);
    const res = await search(value);
    if (res.query === value) {
      setHits(res.hits);
      setLoading(false);
    }
  };

  const handleInput = useCallback(
    async (data: any) => {
      const s = String(data);
      if (s === CTRL_C) process.exit(0);
      switch (state.view) {
        case VIEW.SEARCH: {
          // if (s === ARROW_DOWN || s === ENTER || s === SPACE) {
          //   setView(VIEW.SCROLL); // 设滚动窗口为active
          // }
          dispatch(setView(VIEW.SCROLL)); // 设滚动窗口为active
          break;
        }
        case VIEW.SCROLL: {
          if (s === ENTER) {
            dispatch(setView(VIEW.OVERVIEW));
          }
          break;
        }
        case VIEW.OVERVIEW: {
          if (s === ARROW_DOWN || s === ARROW_UP) {
            dispatch(setView(VIEW.SCROLL));
          }
          if (s === ENTER) {
            if (Object.values(dependencies).length > 0) {
              dispatch(setView(VIEW.INSTALL));
              try {
                await installDependencies();
                process.exit(0);
              } catch (e) {
                process.exit(1);
              }
            } else {
              process.exit(0);
            }
          }
          break;
        }
        case VIEW.INSTALL:
          return;
      }
    },
    [state.view]
  );
  const installDependencies = async () => {
    console.log('安装依赖');
  };
  const handleWillReachEnd = () => {
    console.log('will reach end');
  };

  const toggleDependency = (pkg: IPackage) => {
    console.log('toggle 依赖', pkg.name);
  };

  return (
    <SearchContext.Provider value={{ hits, ...state }}>
      <Box flexDirection="column">
        <SearchWithStdin onChange={handleQueryChange} loading={loading} active />
        <ScrollWithStdin values={hits} onWillReachEnd={handleWillReachEnd} active={state.view === VIEW.SCROLL}>
          {pkg => (
            <PackageWithStdinAndHits
              key={pkg.objectID}
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
