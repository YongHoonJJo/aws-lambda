### < Serverless - Todo App >

#### 프로젝트 설정

```
> mkdir serverless-api
> cd serverless-api
> npm init -y
```

<br>

#### 패키지 설치

```
> npm i express aws-serverless-express body-parser dynamoose dotenv cors
> npm i -D mocha should supertest serverless aws-sdk serverless-apigw-binary
```

aws-sdk는 개발용으로 설치한다. Lambda는 aws-sdk를 기본적으로 포함하고 있기 때문에 실제로 배포할 때는 포함시킬 필요가 없다. dev-dependency로 넣어두면 배포할 때 제외된다.

- Dependencies
  - express : Web Application Framework
  - body-parser : Request Body를 parsing하기 위한 미들웨어
  - aws-serverless-express : Express를 Lambda에서 사용할 수 있도록 Wrapping하는 패키지
  - dynamoose : DynamoDB를 사용하기 쉽도록 Modeling하는 도구
  - dotenv : 환경 변수를 손쉽게 관리할 수 있게 하는 패키지
  - cors : 손쉽게 cors를 허용하는 미들웨어
- Dev-dependencies
  - mocha : 개발 도구
  - supertest : HTTP 테스트를 하기 위한 모듈
  - should: BDD(Behaviour-Driven Development)를 지원하기 위한 모듈
  - serverless: Serverless Framework / 버전확인
  - aws-sdk : AWS 리소스를 사용하기 위한 SDK
  - serverless-apigw-binary: Binary Media Type을 지원하기 위한 플러그인 / 허용할  MIME TYPE 적용



<br>

#### Simple Test

```js
/*** serverless-api/app.js ***/
const express = require('express')
const app = express()
const port = process.env.PORT || 3000

app.get('/*', (req, res, next) => {
  res.status(200).send('Hello Serverless Express!!')
})

app.listen(port, () => {
  console.log(`Server is running at ${port}`)
})
```

<br>

```
> node app.js
```

> 다른 터미널 창을 열어 `curl localhost:3000` 을 확인.

<br>

#### 실습

```yml
# serverless-api/config.yml
AWS_REGION: ap-northeast-2
STAGE: dev
DEPLOYMENT_BUCKET: yonghoon-serverless-hands-on-1 
```

> 사전에 S3 에 `yonghoon-serverless-hands-on-1` 란 버킷을 생성하였다.

<br>

그 외 아래와 같은 파일들을 생성 후 소스코드를 복사.

```
serverless-api/app.js 
serverless-api/bin/www
serverless-api/handler.js
serverless-api/routes/todo.js
serverless-api/spec/todo.spec.js
serverless-api/serverless.yml
serverless-api/.env
```

<br>

package.json 에서 scripts 내용 아래와 같이 변경

```json
"scripts": {
    "test": "mocha spec/*.spec.js --timeout 10000",
    "start": "node bin/www",
    "deploy": "serverless deploy"
  },
```

.env

```
AWS_REGION = ap-northeast-2
```

<br>

#### 소스코드 분석

```js
/*** serverless-api/app.js ***/

require("aws-sdk").config.region = "ap-northeast-2"

// 실제로 사용한다고 가정하면 유저정보를 실어주어야함.
app.use((req, res, next) => {
    res.locals.userId = "1";
    next();
});

module.exports = app;
```

> dynamoDB 에서 userId 를 파티션키로 설정하였는데, 이 프로젝트를 여러 사용자가 공유하는 것으로 만들면 규모가 커지기 때문에, 사용자를 한명으로 고정시키기 위한 하드코딩.
>
> 또한, 로컬에서 실행도 하고, serverless 환경에서 wrapping 을 하기 위해 exports 를 함.

<br>

```js
/*** serverless-api/routes/todo.js ***/
const router = require("express").Router();
const dynamoose = require('dynamoose');
const _ = require('lodash');

dynamoose.AWS.config.region = process.env.AWS_REGION;
const Todo = dynamoose.model('Todo', { // 
    userId: {
        type: String,
        hashKey: true
    }, 
    createdAt: {
        type: String,
        rangeKey: true
    },
    updatedAt: String,
    title: String,
    content: String
}, {
    create: false, // Create a table if not exist,
});

router.get("/", (req, res, next) => {
    const userId = res.locals.userId;
    let lastKey = req.query.lastKey;
    
    return Todo.query('userId').eq(userId).startAt(lastKey).limit(1000).descending().exec((err, result) => {
        if(err) return next(err, req, res, next);
        
        res.status(200).json(result);
    })
});

router.post("/", (req, res, next) => {
    const userId = res.locals.userId;
    const body = req.body;
    
    body.createdAt = new Date().toISOString();
    body.updatedAt = new Date().toISOString();
    body.userId = userId;
    
    return new Todo(body).save((err, result) => {
        if(err) return next(err, req, res, next);
      
        res.status(201).json(result);
    });
});

module.exports = router;
```

> dynamoose.model() 의 첫번째 인자 'Todo' 는 dynamoDB 의 테이블명
>
> dynamoDB 에는 타임스탬프 기능이 없기 때문에 직접 처리.

<br>

bin/www 는 port 를 listen 하는 내용

<br>

```js
/*** serverless-api/handler.js ***/
// lambda.js
'use strict'
const awsServerlessExpress = require('aws-serverless-express')
const app = require('./app')
const binaryMimeTypes = [
  'application/javascript',
  'application/json',
  'application/octet-stream',
  'application/x-font-ttf',
  'application/xml',
  'font/eot',
  'font/opentype',
  'font/otf',
  'font/woff',
  'font/woff2',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'text/comma-separated-values',
  'text/css',
  'text/html',
  'text/javascript',
  'text/plain',
  'text/text',
  'text/xml'
]

const server = awsServerlessExpress.createServer(app, null, binaryMimeTypes)
 
module.exports.api = (event, context) => awsServerlessExpress.proxy(server, event, context)
```

> `api` 가 Lambda 의 handler 가 된다. serverless.yml 에서 handler.ap 를 확인할 수 있다.

<br>

```yaml
### serverless-api/serverless.yml ###
service: ServerlessHandsOnPart1

provider:
  name: aws
  runtime: nodejs8.10
  memorySize: 128
  stage:  ${file(./config.yml):STAGE}
  region: ${file(./config.yml):AWS_REGION}
  deploymentBucket: ${file(./config.yml):DEPLOYMENT_BUCKET}
  environment:
    NODE_ENV: production
  iamRoleStatements:
    - Effect: Allow
      Action:
        - dynamodb:DescribeTable
        - dynamodb:Query
        - dynamodb:Scan
        - dynamodb:GetItem
        - dynamodb:PutItem
        - dynamodb:UpdateItem
        - dynamodb:DeleteItem
      Resource: "arn:aws:dynamodb:${opt:region, self:provider.region}:*:*"

plugins:
 - serverless-apigw-binary
custom:
  apigwBinary:
    types:
      - 'application/json'
      - 'text/html'

functions:
  webapp:
    handler: handler.api
    events:
      - http: 
          path: /{proxy+}
          method: ANY
          cors: true
      - http: 
          path: /{proxy+}
          method: OPTIONS
          cors: true
```

> region, stage, depBucket 에 대한 정보를 따로 관리
>
> Lambda 가 dynamoDB 에 대해 query 를 할 수 있는 권한이 필요.
>
> APIGateway binary 에 대한 옵션으로  'application/json' 과 'text/html' 만 허용. apigateway 에서 이 두 타입에 대해서는 서로 왔다갔다 할 수 있게 된다.
>
> 일반적으로는 path 하나당 함수 하나를 만든다. 하지만, 위와 같이 설정을 하면 proxy 기능으로 모든 리퀘스트를 하나의 람다로 수렴하게 한 상태.
>
>  app.js와 serverless.yml 를 보면, cors관련 옵션이 있다. 보안 상의 이유로, 브라우저들은 스크립트 내에서 초기화되는 cross-origin HTTP 요청을 제한하기 때문에 별도로 API Gateway에서 허용을 해주고, 실제로 동작하는 Lambda에서도 서버처럼 동작하기 때문에 옵션을 추가해야 된다고 한다. 이에 대한 자세한 내용은 [HTTP 접근 제어 (CORS)](https://developer.mozilla.org/ko/docs/Web/HTTP/Access_control_CORS)에서 확인 가능.

 <br>

#### Test Code

```
> npm test
```

<br>

#### Deploy

```
> npx serverless
```

> 현재 설치된 버전의 serverless 를 사용한다.

<br>

```
> npm run deploy
```

> 이 역시 설치된 버전의 serverless 로 실행한다.

<br>

#### 리소스 삭제

```
> sls remove
```

> dynamoDB 테이블 및 버킷들은 별도로 삭제하면 된다



#### Reference

<https://github.com/novemberde/serverless-todo-demo>





