import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';

import Amplify from "aws-amplify";
import config from "./config";

Amplify.configure({ // 상호 작용하고자하는 다양한 AWS 리소스를 설정하는 것
  Auth: { // Cognito
    mandatorySignIn: true, // 사용자들이 앱과 상호 작용하기 전에 로그인해야 하기 때문
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID
  },
  Storage: { // S3
    region: config.s3.REGION,
    bucket: config.s3.BUCKET,
    identityPoolId: config.cognito.IDENTITY_POOL_ID
  },
  API: { // API Gateway
    endpoints: [
      {
        name: "notes", // Amplify에 기본적으로 우리의 API의 이름을 지정하도록하고 있다.
        endpoint: config.apiGateway.URL,
        region: config.apiGateway.REGION
      },
    ]
  }
});

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root')
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
