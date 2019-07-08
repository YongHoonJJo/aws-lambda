### Lambda 로 검색어 크롤러 만들기



Settings 및 install packages

```
> mkdir crawler
> cd crawler
> npm init -y
> npm i cheerio got dynamoose
> npm i -D aws-sdk serverless
```

- Dependencies

  - cheerio : HTML페이지를 파싱하고, 결과 데이터를 수집하기 위한 API를 제공

  - got : 몇 MB에 불과한 http 요청을 간단하게 하는 API 제공
  - dynamoose : DynamoDB를 사용하기 쉽도록 Modeling하는 도구

- Dev-Dependencies

  - aws-sdk : AWS 리소스를 사용하기 위한 SDK
  - serverless : Serverless Framework

<br>

파일 구조

```
serverless-crawler  : Crawler
    ├── handler.js  : Lambda에서 trigger하기 위한 handler
    ├── handler.test.js  : Local에서 handler를 trigger하기 위한 스크립트
    ├── config.yml : serverless.yml에서 사용하기 위한 변수
    ├── package.json
    └── serverless.yml : Serverless Framework config file
```

<br>

package.json 의 scripts를 아래 내용으로 변경

```json
"scripts": {
    "test": "node handler.test.js", 
    "deploy": "serverless deploy"
  },
```

<br>

#### 코드 설명

```yaml
# /serverless-crawler/serverless.yml
service: ServerlessHandsOnPart2

provider:
  name: aws
  runtime: nodejs8.10
  memorySize: 256
  timeout: 30
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

functions:
  crawler:
    handler: handler.crawler
    events:
      - schedule: rate(10 minutes)
```

> 맨 아래, events 의 항목이 http 가 아닌 schedule 로 되어 있는데, rate(10 minutes)는 10분에 한번씩 검색을 해서 넣어놓겠다는 의미. (CloudWatch Events 트리거가 추가되어 있다.)

<br>

#### Reference

<https://github.com/novemberde/serverless-crawler-demo>