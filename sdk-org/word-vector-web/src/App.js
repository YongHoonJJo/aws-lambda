import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'

import InitialStyle from './styles/Initial'
import Layout from './layouts/DefaultLayout'

import HomeView from './views/Home'
import SelectCloudView from './views/SelectCloud';
import WordVectorView from './views/WordVector'
import AccVectorsView from './views/AccVectors'
import SearchRulesView from './views/SearchRules';

function App() {
  return (
    <React.Fragment>
      <InitialStyle />
      <BrowserRouter>
        <Layout>
          <Switch>
            <Route exact path="/" component={HomeView} />
            <Route path="/selectCloud" component={SelectCloudView} />
            <Route path="/wordVector" component={WordVectorView} />
            <Route path="/accVectors" component={AccVectorsView} />
            <Route path="/searchRules" component={SearchRulesView} />
            <Redirect to="/" />
          </Switch>
        </Layout>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
