## Serverless Stack - Client

```
$ npx create-react-app notes-app-client
```

<br>

### 1. Handle Routes with React Router 

```
$ npm install react-router-dom@5.0.1 --save
```

Replace  the following code in **src/index.js** 

```jsx
ReactDOM.render(<App />, document.getElementById('root'));
```

with this:

```jsx
import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root')
);
```

단일 페이지 앱을 개발하기 위해 **React Router**를 사용.

- 라우터로 `BrowserRouter`를 사용한다. 브라우저의 [History](https://developer.mozilla.org/en-US/docs/Web/API/History) API를 사용하여 실제 URL을 만든다.

- `Router`를 사용하여  `App` 컴포넌트를 렌더링하며, 이렇게하면 필요한 경로를  `App` 구성 요소 안에 만들 수 있다.

이제 브라우저로 이동하면 앱이 이전과 마찬가지로 로드되는데, 유일한 차이점은 React Router를 사용하여 페이지를 제공한다는 것이다.

<br>

### < Create Containers >

현재 이 앱에는 콘텐츠를 렌더링하는 컴포넌트가 하나 있다. 노트 작성 앱에 대한 CRUD 에 해당하는 몇 개의 다른 페이지들을 만들어야 하는데, 이를 수행하기 전에 앱의 외부 컨텐츠를 구성 요소 안에 모두 넣고, 내부의 모든 최상위 구성 요소를 렌더링한다.

다양한 페이지를 나타내는 이러한 최상위 구성 요소를 **컨테이너**라고 한다.

#### Add a Navbar

탐색 바를 추가하여 애플리케이션의 외부 컨텐트 만들기.

**src/App.js**

```jsx
import React from "react";
import { Link } from "react-router-dom";
import { Navbar } from "react-bootstrap";
import "./App.css";

function App(props) {
  return (
    <div className="App container">
      <Navbar fluid collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">Scratch</Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
      </Navbar>
    </div>
  );
}

export default App;
```

1. `div.container`에 Bootstrap을 사용하여 고정 너비 컨테이너 생성하기.
2. `fluid` 속성을 사용하여 컨테이너 너비에 맞는 탐색 바를 내부에 추가.
3. React-Router의 `Link` 컴포넌트를 사용하여 앱의 홈페이지 링크를 처리하기. (페이지를 새로 고치지 않아도 된다).

<br>

#### Home 컨테이너 추가하기

이제 외부 컨텐트를 넣기 위한 준비가 되었기 때문에, 홈페이지에 컨테이너를 추가한다. 홈페이지 컨테이너를 추가하면 `/` 경로에 응답한다.

최상위 레벨의 모든 구성 요소를 **src/containers/** 에 저장한다. 이는 단일 페이지 앱의 경로에 응답하고 API 요청을 처리할 구성 요소들이다. (*컨테이너* 라고 부른다.)

**src/containers/Home.js** 추가

```jsx
import React from "react";
import "./Home.css";

export default function Home() {
  return (
    <div className="Home">
      <div className="lander">
        <h1>Scratch</h1>
        <p>A simple note taking app</p>
      </div>
    </div>
  );
}
```

사용자가 현재 로그인되어 있지 않다면, 이 홈페이지를 렌더링한다.

<br>

#### 라우트 설정하기

 `/`에 응답하는 컨테이너를 위해 경로 설정.

**src/Routes.js** 추가

```jsx
import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./containers/Home";

export default function Routes() {
  return (
    <Switch>
      <Route path="/" exact component={Home} />
    </Switch>
  );
}
```

이 구성 요소는 React-Router의 `Switch` 컴포넌트를 사용하여 그 안에 정의 된 첫 번째로 일치하는 경로를 렌더링한다. 지금은 단 하나의 경로만을 가지고 있는 상태.

 `/`를 찾아서 일치 할 때 `Home` 컴포넌트를 렌더링하고, `exact` 속성을 사용하여 `/` 경로와 정확히 일치하는지 확인한다. `/` 경로는 `/`로 시작하는 다른 경로와도 일치하기 때문이다.

<br>

#### 경로 렌더링하기

경로를 App 구성 요소로 렌더링 하기.

**src/App.js**

```jsx
import Routes from "./Routes";

function App(props) {
  return (
    <div className="App container">
      <Navbar fluid collapseOnSelect>
        //...
      </Navbar>
      <Routes />
    </div>
  );
}
```

앱의 다른 경로를 탐색할 때, 탐색 바 아랫 부분이 변경되어 해당 경로가 반영된다.

<br>

### < Adding Links in the Navbar >

navbar 에 몇 가지 링크를 더 추가하는데, 사용자가 처음 방문했을 때 로그인 또는 가입하도록 안내한다.

Replace the `App` function component in **src/App.js** with the following.

```jsx
import { Link } from "react-router-dom";
import { Nav, Navbar, NavItem } from "react-bootstrap";

function App(props) {
  return (
    <div className="App container">
      <Navbar fluid collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">Scratch</Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
            <NavItem href="/signup">Signup</NavItem>
            <NavItem href="/login">Login</NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Routes />
    </div>
  );
}
```

`NavItem` Bootstrap 컴포넌트를 사용하여 navbar에 두 개의 링크를 추가한다.  `Navbar.Collapse` 컴포넌트는 모바일 장치에서 두 개의 링크가 접혀지도록 한다.

그런데 링크를 클릭하면 리디렉션되는 동안 브라우저가 새로 고침된다. 단일 페이지 앱을 제작하고 있으므로 패이지 새로 고침 없이 새 링크로 연결해야 한다.

이 문제를 해결하기 위해 [React Router Bootstrap](https://github.com/react-bootstrap/react-router-bootstrap)이라는 React Router 및 React Bootstrap에서 작동하는 컴포넌트가 필요하다. 이 컴포넌트는 `Navbar` 링크를 감쌀뿐만 아니라, React Router를 사용하여 브라우저를 새로 고치지 않고도 앱을 필요한 링크에 연결할 수 있다.

```
$ npm install react-router-bootstrap --save
```

**src/App.js**

```jsx
import { LinkContainer } from "react-router-bootstrap";

function App(props) {
  return (
    <div className="App container">
      <Navbar fluid collapseOnSelect>
        //...
        <Navbar.Collapse>
          <Nav pullRight>
            <LinkContainer to="/signup">
              <NavItem>Signup</NavItem>
            </LinkContainer>
            <LinkContainer to="/login">
              <NavItem>Login</NavItem>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Routes />
    </div>
  );
}
```

`Link` 를`LinkContainer`로 감싼 상태.

브라우저로 넘어 가서 로그인 링크를 클릭하면 링크가 탐색 표시 줄에 강조 표시되며, 또한 리디렉션하는 동안 페이지를 새로 고치지 않게 된다.

<br>

### < Handle 404s >

React Router로 404를 처리하는 방법.

#### 컴포넌트 만들기

**src/containers/NotFound.js**

```jsx
import React from "react";
import "./NotFound.css";

export default () =>
  <div className="NotFound">
    <h3>Sorry, page not found!</h3>
  </div>;
```

<br>

### < Add a Catch All Route >

**src/Routes.js** 에서 `<Switch>` 블록 마지막 줄에 추가.

```jsx
{ /* 최종적으로 일치하지 않는 모든 경로를 감지합니다. */ }
<Route component={NotFound} />
```

<br>

### 3. Configure AWS Amplify

React 앱이 AWS 리소스와 대화할 수 있도록 하기 위해 [AWS Amplify](https://github.com/aws/aws-amplify) 라이브러리를 사용한다.

AWS Amplify는 백엔드에 쉽게 연결할 수 있도록 몇 가지 간단한 모듈(인증, API 및 저장소)을 제공한다.

#### AWS Amplify 설치하기

```
$ npm install aws-amplify --save
```

<br>

#### Config 만들기

**src/config.js** 추가

```js
export default {
  s3: {
    REGION: "YOUR_S3_UPLOADS_BUCKET_REGION",
    BUCKET: "YOUR_S3_UPLOADS_BUCKET_NAME"
  },
  apiGateway: {
    REGION: "YOUR_API_GATEWAY_REGION",
    URL: "YOUR_API_GATEWAY_URL"
  },
  cognito: {
    REGION: "YOUR_COGNITO_REGION",
    USER_POOL_ID: "YOUR_COGNITO_USER_POOL_ID",
    APP_CLIENT_ID: "YOUR_COGNITO_APP_CLIENT_ID",
    IDENTITY_POOL_ID: "YOUR_IDENTITY_POOL_ID"
  }
};
```

<br>

#### AWS Amplify 추가하기

**src/index.js** 에 내용 추가

```jsx
import React from 'react';
//...

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
```

- Amplify는 Cognito를 `Auth`, S3을 `Storage`, API Gateway를 `API`라고 부른다.
- Auth에 대한 `mandatorySignIn` 플래그는 true로 설정되어 있다. 사용자들이 앱과 상호 작용하기 전에 로그인해야 하기 때문이다.
- `name : "notes"`는 Amplify에 기본적으로 우리의 API의 이름을 지정하도록하고 있다.. Amplify를 사용하면 앱에서 사용할 여러 API를 추가 할 수 있다. 이 프로젝트의 경우, 전체 백엔드는 단 하나의 API 이다.
- `Amplify.configure()`는 상호 작용하고자하는 다양한 AWS 리소스를 설정하는 것. 여기서는 구성과 관련하여 특별한 설정을 하지 않는다. (필요치 않은 것일 수도 있지만 설정을 초기화하기 위한 것).

<br>

### 4. Create a Login Page

#### Add the Container

**src/containers/Login.js**

```jsx
import React, { useState } from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Login.css";

export default function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function validateForm() {
    return email.length > 0 && password.length > 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <div className="Login">
      <form onSubmit={handleSubmit}>
        <FormGroup controlId="email" bsSize="large">
          <ControlLabel>Email</ControlLabel>
          <FormControl
            autoFocus
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </FormGroup>
        <FormGroup controlId="password" bsSize="large">
          <ControlLabel>Password</ControlLabel>
          <FormControl
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
          />
        </FormGroup>
        <Button block bsSize="large" disabled={!validateForm()} type="submit">
          Login
        </Button>
      </form>
    </div>
  );
}
```

We are introducing a couple of new concepts in this.

1. Right at the top of our component, we are using the [useState hook](https://reactjs.org/docs/hooks-state.html) to store what the user enters in the form. The `useState` hook just gives you the current value of the variable you want to store in the state and a function to set the new value. 
2. We then connect the state to our two fields in the form using the `setEmail` and `setPassword` functions to store what the user types in — `e.target.value`. Once we set the new state, our component gets re-rendered. The variables `email` and `password` now have the new values.
3. We are setting the form controls to show the value of our two state variables `email` and `password`. In React, this pattern of displaying the current form value as a state variable and setting the new one when a user types something, is called a [Controlled Component](https://reactjs.org/docs/forms.html#controlled-components).
4. We are setting the `autoFocus` flag for our email field, so that when our form loads, it sets focus to this field.
5. We also link up our submit button with our state by using a validate function called `validateForm`. This simply checks if our fields are non-empty, but can easily do something more complicated.
6. Finally, we trigger our callback `handleSubmit` when the form is submitted. For now we are simply suppressing the browsers default behavior on submit but we’ll do more here later.

<br>

#### Add the Route

**src/Routes.js** 에 추가.

```jsx
import Login from "./containers/Login";

<Route path="/login" exact component={Login} />
```

<br>

### < Login with AWS Cognito >

AWS Amplify를 사용하여 Amazon Cognito 설정에 로그인 하기.

**src/containers/Login.js** 에 추가

```jsx
import { Auth } from "aws-amplify";

async function handleSubmit(event) {
  event.preventDefault();

  try {
    await Auth.signIn(email, password);
    alert("Logged in");
  } catch (e) {
    alert(e.message);
  }
}
```

- `email`과`password`를 가져 와서 Amplify의`Auth.signIn()` 메소드를 호출한다. 이 메서드는 사용자를 비동기적으로 로깅하므로 promise를 반환한다.

<br>

### < Add the Session to the State >

#### Update the App State

**src/App.js ** 에 추가.

```jsx
const [isAuthenticated, userHasAuthenticated] = useState(false);
```

<br>

#### Pass the Session State to the Routes

**src/App.js** 

```jsx
<Routes />
```

```jsx
<Routes appProps={{ isAuthenticated, userHasAuthenticated }} />
```

위에서 아래로 대체.

<br>

```
$ mkdir src/components/
```

we’ll be storing all our React components that are not dealing directly with our API or responding to routes.

<br>

**src/components/AppliedRoute.js** 추가

```jsx
import React from "react";
import { Route } from "react-router-dom";

export default function AppliedRoute({ component: C, appProps, ...rest }) {
  return (
    <Route {...rest} render={props => <C {...props} {...appProps} />} />
  );
}
```

This simple component creates a `Route` where the child component that it renders contains the passed in props. Let’s take a quick look at how this being done.

- The `Route` component takes a prop called `component` that represents the component that will be rendered when a matching route is found. We want our `appProps` to be applied to this component.
- The `Route` component can also take a `render` method in place of the `component`. This allows us to control what is passed in to our component.
- Based on this we can create a component that returns a `Route` that takes a `component` and `appProps` prop. This allows us to pass in the component we want rendered and the props that we want applied.
- Finally, we take `component` (set as `C`) and `appProps` and render inside our `Route` using the inline function; `props => `. Note, the `props` variable in this case is what the Route component passes us. Whereas, the `appProps` are the props that we are trying to set in our `App` component.

<br>

To use this component, we are going to include it in the routes where we need to have the `appProps` passed in.

**src/Routes.js**

```jsx
import AppliedRoute from "./components/AppliedRoute";

export default function Routes({ appProps }) {
  return (
    <Switch>
      <AppliedRoute path="/" exact component={Home} appProps={appProps} />
      <AppliedRoute path="/login" exact component={Login} appProps={appProps} />
      { /* Finally, catch all unmatched routes */ }
      <Route component={NotFound} />
    </Switch>
  );
}
```

Replace the `alert('Logged in');` line with the following in `src/containers/Login.js`.

```
props.userHasAuthenticated(true);
```

<br>

#### Create a Logout Button

**src/App.js** 에서

```jsx
<LinkContainer to="/signup">
  <NavItem>Signup</NavItem>
</LinkContainer>
<LinkContainer to="/login">
  <NavItem>Login</NavItem>
</LinkContainer>
```

```jsx
function handleLogout() {
  userHasAuthenticated(false);
}

{isAuthenticated
  ? <NavItem onClick={handleLogout}>Logout</NavItem>
  : <>
      <LinkContainer to="/signup">
        <NavItem>Signup</NavItem>
      </LinkContainer>
      <LinkContainer to="/login">
        <NavItem>Login</NavItem>
      </LinkContainer>
    </>
}
```

위에서 아래로 대체.

<br>

### < Load the State from the Session >

로그인 정보를 계속 유지하려면 브라우저 세션에 저장하고 로드해야 한다. 쿠키 또는 로컬 저장소를 사용하여이 작업을 수행 할 수 있는 몇 가지 방법이 있다. 다행히도 AWS Amplify는 자동으로 이 작업을 수행하며, AWS Amplify를 통해 해당 내용을 읽고 응용 프로그램 state로 불러오면 된다.

Amplify는 `Auth.currentSession()` 메소드를 사용하여 현재 사용자 세션을 얻을 수 있는데, 만일 세션 객체가 있다면 promise 형태로 반환한다.

#### 사용자 세션 불러오기

앱이 브라우저에 로드 될 때 사용자 세션을 불러와야 한다.

**src/App.js** 

```jsx
import { Auth } from "aws-amplify";

const [isAuthenticating, setIsAuthenticating] = useState(true);

useEffect(() => {
  onLoad();
}, []);

async function onLoad() {
  try {
    await Auth.currentSession();
    userHasAuthenticated(true);
  }
  catch(e) {
    if (e !== 'No current user') {
      alert(e);
    }
  }

  setIsAuthenticating(false);
}
```

When our app first loads, it’ll run the `onLoad` function. All this does is load the current session. If it loads, then it updates the `isAuthenticating` state variable once the process is complete. It does so by calling `setIsAuthenticating(false)`. The `Auth.currentSession()` method throws an error `No current user` if nobody is currently logged in. We don’t want to show this error to users when they load up our app and are not signed in. Once `Auth.currentSession()` runs successfully, we call `userHasAuthenticated(true)` to set that the user is logged in.

So the top of our `App` function should now look like this:

```jsx
function App(props) {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, userHasAuthenticated] = useState(false);

  useEffect(() => {
    onLoad();
  }, []);

  ...
```

<br>

#### Render When the State Is Ready

사용자 세션을 로드하는 것은 비동기 프로세스이기 때문에 처음 로드 할 때 앱이 state를 변경하지 않도록 해야한다. 이렇게 하기 위해 `isAuthenticating`가 `false`가 될 때까지 앱을 렌더링하지 말아야 한다.

여기서는`isAuthenticating` 플래그에 기반하여 앱을 조건부로 렌더링한다. (**src/App.js**)

```jsx
return (
  !isAuthenticating &&
  <div className="App container">
    <Navbar fluid collapseOnSelect>
      <Navbar.Header>
        <Navbar.Brand>
          <Link to="/">Scratch</Link>
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav pullRight>
          {isAuthenticated
            ? <NavItem onClick={handleLogout}>Logout</NavItem>
            : <>
                <LinkContainer to="/signup">
                  <NavItem>Signup</NavItem>
                </LinkContainer>
                <LinkContainer to="/login">
                  <NavItem>Login</NavItem>
                </LinkContainer>
              </>
          }
        </Nav>
      </Navbar.Collapse>
    </Navbar>
    <Routes appProps={{ isAuthenticated, userHasAuthenticated }} />
  </div>
);
```

하지만 로그 아웃하고 페이지를 새로 고침하면 여전히 로그인되어 있다. 이를 해결하기 위해 로그아웃할 때 세션을 지워야 한다.

<br>

### < Clear the Session on Logout >

현재 앱의 state에서만 사용자 세션을 제거하고 있다. 그러나 페이지를 새로 고침 할 때 브라우저의 로컬 저장소(Amplify가 사용하는)에서 사용자 세션을 불러와 다시 로그인한다.

AWS Amplify에는 Auth.signOut() 메소드를 통해 해결할 수 있다.

**src/App.js**

```jsx
async function handleLogout() {
  await Auth.signOut();

  userHasAuthenticated(false);
}
```

<br>

### < Redirect on Login and Logout >

자연스로운 로그인 흐름을 완성하려면 추가적으로 두 가지 작업을 더 수행해야 한다.

1. 로그인 한 후 사용자를 홈페이지로 리디렉션.
2. 로그아웃 한 후 다시 로그인 페이지로 리디렉션.

React Router v4와 함께 제공되는 `history.push` 메소드를 사용한다.

<br>

#### 로그인시 홈 화면으로 리디렉션

**src/containers/Login.js** 의 `handleSubmit` 메소드에서.

```jsx
async function handleSubmit(event) {
  event.preventDefault();

  try {
    await Auth.signIn(email, password);
    props.userHasAuthenticated(true);
    props.history.push("/");
  } catch (e) {
    alert(e.message);
  }
}
```

<br>

#### 로그아웃 한 후에 로그인 화면으로 리디렉션

 `App` 컴포넌트는 `Route` 컴포넌트 내부에서 렌더링되지 않기 때문에 라우터 속성에 직접 접근 할 수 없다. `App` 컴포넌트에서 라우터 속성을 사용하기 위해서는 `withRouter` [Higher-Order 컴포넌트](https://facebook.github.io/react/docs/higher-order-components)(또는 HOC)를 사용할 필요가 있다.

**src/App.js**

```jsx
export default App;
```

```jsx
import { Link, withRouter } from "react-router-dom";

export default withRouter(App);
```

위에서 아래로 대체

```jsx
handleLogout = async event => {
  await Auth.signOut();
  this.userHasAuthenticated(false);
  this.props.history.push("/login"); // 추가
}
```

<br>

### < Give Feedback While Logging In >

로그인하는 동안 사용자에게는 몇 가지 피드백을 제공하는 것이 중요하다. 그래서 응답이 없는 것과는 달리 앱이 여전히 작동 중임을 알 수 있다.

#### isLoading 플래그 사용하기

**src/containers/Login.js** 에 추가 및 업데이트

```jsx
const [isLoading, setIsLoading] = useState(false);

async function handleSubmit(event) {
  event.preventDefault();

  setIsLoading(true);

  try {
    await Auth.signIn(email, password);
    props.userHasAuthenticated(true);
    props.history.push("/");
  } catch (e) {
    alert(e.message);
    setIsLoading(false);
  }
}
```

#### Create a Loader Button

버튼의 상태 변화를 반영하기 위해 `isLoading` 플래그에 따라 다르게 렌더링 한다. 그리고 다른 곳들에서 이 코드를 사용할 예정이기 때문에 재사용 가능한 컴포넌트를 만드는 것이 보다 합리적이다.

**src/components/LoaderButton.js**

```jsx
import React from "react";
import { Button, Glyphicon } from "react-bootstrap";
import "./LoaderButton.css";

export default function LoaderButton({isLoading, className = "", disabled = false, ...props}) {
  return (
    <Button
      className={`LoaderButton ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Glyphicon glyph="refresh" className="spinning" />}
      {props.children}
    </Button>
  );
}
```

 `isLoading` 플래그와 버튼이 두 가지 상태(기본 상태 및 로드 상태)를 나타내도록 텍스트를 사용하는 매우 간단한 컴포넌트다. `disabled` 속성은 `Login` 버튼이 현재 가지고있는 결과이고, `isLoading`이 `true` 일 때 버튼이 비활성화되도록 한다. 이렇게 하면 사용자가 로그인하는 동안 이 버튼을 클릭 할 수 없게 된다.

<br>

#### isLoading 플래그를 사용하여 렌더링하기

**src/containers/Login.js**

```jsx
<Button block bsSize="large" disabled={!validateForm()} type="submit">
  Login
</Button>
```

```jsx
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";

<LoaderButton
  block
  type="submit"
  bsSize="large"
  isLoading={isLoading}
  disabled={!validateForm()}
>
  Login
</LoaderButton>
```

위에서 아래로 대체. 로그인을 시도하면 로그인이 완료되기 전에 로딩이 진행중인 상태가 표시된다.





<br>

### Reference

<https://serverless-stack.com/chapters/ko/handle-routes-with-react-router.html>