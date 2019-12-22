## Serverless Stack 

### Project Install

```
$ npx serverless install --url https://github.com/AnomalyInnovations/serverless-nodejs-starter --name notes-app-api
$ npm install
$ npm i -D serverelss
```

- **handler.js** 파일에는 AWS Lambda에 배포 될 서비스/기능의 실제 코드가 들어있다.
- **serverless.yml** 파일에는 Serverless가 제공 할 AWS 서비스 구성 및 구성 방법이 포함되어 있다.
- 단위 테스트를 추가 할 수있는`tests/` 디렉토리도 있다.

<br>

### Install Packages

```
$ npm i -D aws-sdk
$ npm i uuid
```

- **aws-sdk**를 사용하면 다양한 AWS 서비스와 통신할 수 있다.
- **uuid**는 고유 ID를 생성한다. DynamoDB에 데이터를 저장하는 데 필요.