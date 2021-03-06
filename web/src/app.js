import '@babel/polyfill';

import createHistory from 'history/createBrowserHistory';
import React from 'react';
import 'react-dates/initialize';
import { render } from 'react-dom';
import { routerMiddleware } from 'connected-react-router';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger'; // eslint-disable-line import/no-extraneous-dependencies
import thunk from 'redux-thunk';

import { initI18n } from './i18n';
import reducer from './reducers';
import Root from './components/Root';

// Set locale based on browser language
// if it matches one of our SUPPORTED_LOCALES
// otherwise, set to DEFAULT_LOCALE ("en")
initI18n();

const history = createHistory();

const middleware = [thunk, routerMiddleware(history)];
if (process.env.NODE_ENV !== 'production') {
  middleware.push(createLogger());
}

const store = createStore(reducer(history), applyMiddleware(...middleware));

render(
  <Root history={history} store={store} />,
  document.getElementById('app')
);
