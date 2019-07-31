import { VIEW } from './Emma';

export interface State {
  view: VIEW;
  query: string;
}
export interface Action {
  type: string;
  view?: VIEW;
  query?: string;
}
export function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'SET_VIEW': {
      return {
        ...state,
        view: action.view
      };
    }
    case 'SET_QUERY': {
      return {
        ...state,
        query: action.query
      };
    }
  }
}

export const setView = (view: VIEW) => ({ type: 'SET_VIEW', view });
export const setQuery = (query: string) => ({ type: 'SET_QUERY', query });
