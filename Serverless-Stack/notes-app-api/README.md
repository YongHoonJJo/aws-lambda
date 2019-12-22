## Serverless Stack 

### Set up the Serverless Framework

#### Project Install

```
$ npx serverless install --url https://github.com/AnomalyInnovations/serverless-nodejs-starter --name notes-app-api
$ npm install
$ npm i -D serverelss
```

- **handler.js** 파일에는 AWS Lambda에 배포 될 서비스/기능의 실제 코드가 들어있다.
- **serverless.yml** 파일에는 Serverless가 제공 할 AWS 서비스 구성 및 구성 방법이 포함되어 있다.
- 단위 테스트를 추가 할 수있는`tests/` 디렉토리도 있다.

<br>

#### Install Packages

```
$ npm i -D aws-sdk
$ npm i uuid
```

- **aws-sdk**를 사용하면 다양한 AWS 서비스와 통신할 수 있다.
- **uuid**는 고유 ID를 생성한다. DynamoDB에 데이터를 저장하는 데 필요.

<br>

### Add Support for ES6/ES7 JavaScript

핸들러 함수에서 ES import/export를 사용하기 위해 [Babel](https://babeljs.io/) 및 [Webpack 4](https://webpack.github.io/)를 사용하여 코드를 트랜스파일링 한다. 또한, Webpack을 사용하면 Lambda 함수에서 사용된 코드만을 포함하여 Lambda 함수 패키지의 생성을 최적화할 수 있다. 이를 통하여 패키지의 크기가 줄고 콜드 스타트 시간이 감소할 수 있다.

Serverless Framework는 이를 자동으로 수행하는 플러그인을 지원한다. 여기서는 유명한 플러그인 [serverless-webpack](https://github.com/serverless-heaven/serverless-webpack)의 확장인 [serverless-bundle](https://github.com/AnomalyInnovations/serverless-bundle)을 사용한다.

<br>

템플릿을 통해 설치한 이유는 아래와 같다.

```
- Lambda 함수 패키지 생성의 최적화
- 프론트 엔드 및 백엔드에서 비슷한 버전의 JavaScript 사용
- 트랜스파일링된 코드에 오류 메시지에 대한 올바른 줄 번호가 있는지 확인하기
- 코드 린트(Lint) 단위 테스트 지원 추가
- 로컬에서 백엔드 API 실행이 가능하도록 하기
- Webpack 및 Babel 설정을 신경쓰지 않도록 하기
```

<br>

#### Serverless Webpack

ES 코드를 Node.js v10.x JavaScript로 변환하는 과정은 serverless-bundle 플러그인에 의해 수행된다. 이 플러그인은`serverless.yml`에 추가 되었다.

**serverless.yml**

```yaml
service: notes-app-api

# Create an optimized package for our functions
package:
  individually: true

plugins:
  - serverless-bundle # Package our functions with Webpack
  - serverless-offline
  - serverless-dotenv-plugin # Load .env as environment variables

provider:
  name: aws
  runtime: nodejs10.x
  stage: prod
  region: us-east-1
```

- service 옵션을 통해 서비스명을 설정하고, Serverless Framework는 이 이름을 사용하여 AWS에 스택을 만든다. 즉, 이름을 변경하고 프로젝트를 배포하면 완전히 새로운 프로젝트가 만들어진다.
- 우리가 포함한 `serverless-bundle`과 `serverless-offline` , `serverless-dotenv-plugin` 에 주목할 필요가 있는데, `serverless-offline` 은 로컬 개발환경을 구성하는 데 유용하며, `serverless-dotenv-plugin` 은 람다의 환경변수로 `.env` 파일을 로드할 때 사용한다. `serverless-bundle` 은 위에서 설명한 바와 같다.

<br>

또한, 아래와 같은 옵션값들을 사용한다.

```yaml
# 우리가 사용할 함수에 최적화된 패키지를 생성합니다
package:
  indivitually: true
```

- Serverless 프레임워크는 기본값으로 어플리케이션에 포함되어있는 Lambda 함수들을 모두 포함하는 커다란 패키지를 생성한다. 큰 크기의 Lambda 함수 패키지는 더 긴 콜드 스타트를 유발할 수 있다. `individually: true`로 설정하면, Serverless 프레임워크가 Lambda 함수 하나당 하나의 패키지를 각각 생성하게 된다. 이러한 설정은 Serverless-bundle(과 Webpack)과 함께 최적화된 패키지를 생성하는 데에 도움이 된다. 물론 빌드가 느려지겠지만, 성능 상의 이득이 훨씬 큰 의미가 있을 것이다.

<br>

### Reference

<https://serverless-stack.com/chapters/ko/setup-the-serverless-framework.html>

<https://serverless-stack.com/chapters/ko/add-support-for-es6-es7-javascript.html>