import React, { useState, useEffect } from 'react';
import opn from 'opn';
import { IPackage, WithSearchContext, SearchContext } from '../algolia';
import { IDependency } from '../installer';
import { WithStdin } from '../utils';
import { Box, Color, Text, StdinContext } from 'ink';
const SPACE = ' ';
const ARROW_LEFT = '\u001B[D';
const ARROW_RIGHT = '\u001B[C';

interface Props {
  pkg: IPackage;
  active: boolean;
  onClick: (pkg: IPackage) => void;
  type: IDependency['type'] | undefined;
}

const Package: React.FC<WithSearchContext<WithStdin<Props>>> = ({
  pkg,
  active,
  onClick,
  type,
  stdin,
  setRawMode,
  hits
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const handleInput = (data: any) => {
    const char = String(data);
    if (!active) return;
    switch (char) {
      case SPACE:
        return onClick(pkg);
      case ARROW_RIGHT: {
        if (showDetails && pkg.repository) {
          opn(pkg.repository.url); // 打开浏览器
        }
        return setShowDetails(true);
      }
      case ARROW_LEFT: {
        return setShowDetails(false);
      }
    }
  };

  const getColumnWidth = (column: keyof IPackage): number => {
    const parsedHits = hits
      .map(hit => {
        switch (column) {
          case 'owner': {
            return hit.owner.name;
          }
          case 'repository': {
            if (hit.repository) {
              return hit.repository.url;
            } else {
              return '';
            }
          }
          default: {
            return hit[column];
          }
        }
      })
      .map(c => c.length);
    return Math.max(...parsedHits);
  };

  useEffect(() => {
    if (setRawMode) setRawMode(true);
    stdin.on('data', handleInput);
    return () => {
      if (setRawMode) setRawMode(false);
      stdin.removeListener('data', handleInput);
    };
  }, []);

  useEffect(() => {
    if (active === false) setShowDetails(false);
  }, [active]);

  const Cursor = () => (
    <Box marginRight={1}>
      {(() => {
        if (active) {
          if (type === 'dependency') return <Color cyan>{`›`}</Color>;
          if (type === 'devDependency') return <Color blue>{`›`}</Color>;
          return <Color magenta>{`›`}</Color>;
        } else {
          if (type === 'dependency') return <Color cyan>{`◉`}</Color>;
          if (type === 'devDependency') return <Color blue>{`◉`}</Color>;
          return <Text>{` `}</Text>;
        }
      })()}
    </Box>
  );
  const Downloads = () => {
    return (
      <Box width={getColumnWidth('humanDownloadsLast30Days')} marginRight={1}>
        <Text>{pkg.humanDownloadsLast30Days}</Text>
      </Box>
    );
  };
  const Name = () => (
    <Box width={getColumnWidth('name')} marginRight={1}>
      <Text bold>{pkg.name}</Text>
    </Box>
  );
  const Version = () => {
    return (
      <Box width={getColumnWidth('version')} marginRight={1}>
        <Text italic>{pkg.version}</Text>
      </Box>
    );
  };
  const Owner = () => (
    <Box width={getColumnWidth('owner')} marginRight={1}>
      <Text>
        <Color green>{pkg.owner.name}</Color>
      </Text>
    </Box>
  );
  const Description = () => {
    return (
      <Box flexDirection="row" marginX={2}>
        <Text>{pkg.description}</Text>
      </Box>
    );
  };
  if (showDetails) {
    return (
      <Box flexDirection="column" marginY={1}>
        <Box flexDirection="row">
          <Cursor />
          <Downloads />
          <Name />
          <Version />
          <Owner />
        </Box>
        <Box>
          <Description />
        </Box>
      </Box>
    );
  }
  return (
    <Box flexDirection="row" marginY={0} marginX={0}>
      <Cursor />
      <Downloads />
      <Name />
      <Version />
      <Owner />
    </Box>
  );
};

const PackageWithStdinAndHits: React.FC<Props> = props => {
  return (
    <SearchContext.Consumer>
      {({ hits }) => (
        <StdinContext.Consumer>
          {({ stdin, setRawMode }) => <Package {...props} stdin={stdin} setRawMode={setRawMode} hits={hits} />}
        </StdinContext.Consumer>
      )}
    </SearchContext.Consumer>
  );
};

export { PackageWithStdinAndHits };
