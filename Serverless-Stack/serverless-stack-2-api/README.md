## Building a Serverless REST API

### < Initialize the Backend Repo >

```
$ git clone --branch handle-api-gateway-cors-errors --depth 1 https://github.com/AnomalyInnovations/serverless-stack-demo-api.git serverless-stack-2-api/
$ cd serverless-stack-2-api/
$ rm -rf .git/
$ npm install
```

<br>

**create.js**

```js
import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tableName,
    Item: { // 'Item'은 생성 될 항목의 속성을 포함한다.
      userId: event.requestContext.identity.cognitoIdentityId,
      noteId: uuid.v1(),
      content: data.content,
      attachment: data.attachment,
      createdAt: Date.now()
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    return failure({ status: false });
  }
}
```

- 노트를 만드는 API로 노트 오브젝트를 입력으로 사용하고, 새 ID로 데이터베이스에 저장한다. 노트 오브젝트는 `content` 필드(노트의 내용)와 `attachment` 필드(업로드 된 파일의 URL)를 포함한다.

- 'Item'은 생성 될 항목의 속성을 포함한다.
  - 'userId': userId는 Cognito ID Pool 과 연계하는데, ID는 인증 된 사용자의 사용자 ID를 사용한다.
  - 'noteId': 고유한 uuid
  - 'content': 요청 본문으로부터 파싱 됨
  - 'attachment': 요청 본문에서 파싱 됨
  - 'createdAt': 현재 유닉스 타임 스탬프
- event.body`에서 입력을 파싱한다. 이것은 HTTP 요청 매개변수를 나타낸다.
- DynamoDB 테이블의 이름은 `process.env.tableName` 를 사용하여 환경변수에서 읽어온다. 이것에 대한 설정은 `serverless.yml` 에서 하며, 이를 통해 각 함수에서 하드코딩을 하지 않아도 된다.
- `userId`는 요청의 일부로 들어오는 연합 ID로, 접속자가 사용자 풀을 통해 인증 된 후에 설정된다. 
- DynamoDB를 호출하여 생성 된 `noteId` 및 현재 날짜가 `createdAt`인 새 객체를 넣는다.
- 성공하면 HTTP 상태 코드가 `200`인 새로 생성 된 노트 객체와 응답 헤더를 반환하여 **CORS(Cross-Origin Resource Sharing)** 를 사용하도록 설정한다.
- 그리고 DynamoDB 호출이 실패하면 HTTP 상태 코드가 ‘500’인 오류를 반환한다.

<br>

**get.js**

```js
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.tableName,
    // 'Key'는 검색 할 항목의 파티션 키와 정렬 키를 정의한다.
    // - 'userId': 인증 된 사용자의 ID 풀에 해당하는 인증 아이디
    // - 'noteId': 경로 매개 변수
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      noteId: event.pathParameters.id
    }
  };

  try {
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {
      // Return the retrieved item
      return success(result.Item);
    } else {
      return failure({ status: false, error: "Item not found." });
    }
  } catch (e) {
    return failure({ status: false });
  }
}

```

- 이전의 `create.js` 와 비슷한 구조를 가지지만, 요청을 통해 전달되는`noteId` 와 `userId`가 주어진 노트 객체를 얻기 위해 `dynamoDbLib.call ( 'get', params)`을 수행한다는 것.

<br>

**list.js**

```js
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.tableName,
    // 'KeyConditionExpression' defines the condition for the query
    // - 'userId = :userId': only return items with matching 'userId'
    //   partition key
    // 'ExpressionAttributeValues' defines the value in the condition
    // - ':userId': defines 'userId' to be Identity Pool identity id
    //   of the authenticated user
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId
    }
  };

  try {
    const result = await dynamoDbLib.call("query", params);
    // Return the matching list of items in response body
    return success(result.Items);
  } catch (e) {
    return failure({ status: false });
  }
}
```

- DynamoDB의 `query` 호출 내용에 `userId` 값을 전달한다는 것을 제외하면 `get.js`와 매우 유사하다.

<br>

**update.js**

```js
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: process.env.tableName,
    // 'Key' defines the partition key and sort key of the item to be updated
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'noteId': path parameter
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      noteId: event.pathParameters.id
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "SET content = :content, attachment = :attachment",
    ExpressionAttributeValues: {
      ":attachment": data.attachment || null,
      ":content": data.content || null
    },
    // 'ReturnValues' specifies if and how to return the item's attributes,
    // where ALL_NEW returns all attributes of the item after the update; you
    // can inspect 'result' below to see how it works with different settings
    ReturnValues: "ALL_NEW"
  };

  try {
    await dynamoDbLib.call("update", params);
    return success({ status: true });
  } catch (e) {
    return failure({ status: false });
  }
}
```

-  `create.js` 함수와 비슷한 형식이다. 여기서는 `매개 변수`에 새로운`content` 와 `attachment` 값으로 `update` DynamoDB를 호출한다.

<br>

**delete.js**

```js
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const params = {
    TableName: process.env.tableName,
    // 'Key' defines the partition key and sort key of the item to be removed
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'noteId': path parameter
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId,
      noteId: event.pathParameters.id
    }
  };

  try {
    await dynamoDbLib.call("delete", params);
    return success({ status: true });
  } catch (e) {
    return failure({ status: false });
  }
}

```

- 삭제할 노트의 `userId` 와 `noteId` 값을 이용해 DynamoDB에 `delete`를 호출한다.

<br>

**response-lib**

```js
export function success(body) {
  // 새로운 항목이 생성되면 상태 코드 200을 반환
  return buildResponse(200, body);
}

export function failure(body) {
  // 에러발생시 상태코드 500을 반환
  return buildResponse(500, body);
}

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: { // // CORS (Cross-Origin Resource Sharing)를 사용하도록 응답 헤더를 설정한다.
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(body)
  };
}
```

**dynamodb-lib.js**

```js
import AWS from "aws-sdk";

export function call(action, params) {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  return dynamoDb[action](params).promise();
}
```

- AWS JS SDK는 람다 함수의 현재 리전을 기반으로 작업 리전을 가정한다. 따라서 DynamoDB 테이블이 다른 리전에있는 경우 DynamoDB 클라이언트를 초기화하기 전에 AWS.config.update ({region : “my-region”})를 호출하여 설정해야한다.

<br>

#### API 엔드포인트 구성

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

  # These environment variables are made available to our functions
  # under process.env.
  environment:
    tableName: notes
    stripeSecretKey: ${env:STRIPE_SECRET_KEY}

  # 'iamRoleStatements' defines the permission policy for the Lambda function.
  # In this case Lambda functions are granted with permissions to access DynamoDB.
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
      Resource: "arn:aws:dynamodb:us-east-1:*:*"

functions:
  # Defines an HTTP API endpoint that calls the main function in create.js
  # - path: url path is /notes
  # - method: POST request
  # - cors: enabled CORS (Cross-Origin Resource Sharing) for browser cross domain api call
  # - authorizer: authenticate using the AWS IAM role
  create:
    handler: create.main
    events:
      - http:
          path: notes
          method: post
          cors: true
          authorizer: aws_iam

  get:
    # Defines an HTTP API endpoint that calls the main function in get.js
    # - path: url path is /notes/{id}
    # - method: GET request
    handler: get.main
    events:
      - http:
          path: notes/{id}
          method: get
          cors: true
          authorizer: aws_iam

  list:
    # Defines an HTTP API endpoint that calls the main function in list.js
    # - path: url path is /notes
    # - method: GET request
    handler: list.main
    events:
      - http:
          path: notes
          method: get
          cors: true
          authorizer: aws_iam

  update:
    # Defines an HTTP API endpoint that calls the main function in update.js
    # - path: url path is /notes/{id}
    # - method: PUT request
    handler: update.main
    events:
      - http:
          path: notes/{id}
          method: put
          cors: true
          authorizer: aws_iam

  delete:
    # Defines an HTTP API endpoint that calls the main function in delete.js
    # - path: url path is /notes/{id}
    # - method: DELETE request
    handler: delete.main
    events:
      - http:
          path: notes/{id}
          method: delete
          cors: true
          authorizer: aws_iam

  billing:
    # Defines an HTTP API endpoint that calls the main function in billing.js
    # - path: url path is /billing
    # - method: POST request
    handler: billing.main
    events:
      - http:
          path: billing
          method: post
          cors: true
          authorizer: aws_iam

# Create our resources with separate CloudFormation templates
resources:
  # API Gateway Errors
  - ${file(resources/api-gateway-errors.yml)}
```

- **create**: create.js의 메인 함수를 호출하는 HTTP API 엔드포인트를 정의
  - `/notes` 엔드포인트에서`post` 요청을 처리하도록 지정한다. 단일 람다 함수를 사용하여 단일 HTTP 이벤트에 응답하는이 패턴은 [Microservices 아키텍처](https://en.wikipedia.org/wiki/Microservices)와 매우 비슷하다. 
  - CORS 지원을 true로 설정했다. 프론트 엔드가 다른 도메인에서 제공되기 때문이다.
  - authorizer 는 사용자의 IAM 자격 증명을 기반으로 API에 대한 액세스를 제한하려고 한다.
- **get**: get.js의 main 함수를 호출하는 HTTP API 엔드포인트를 정의
  - path: /notes/{id} url 경로
  - method: GET 요청
- **list**: list.js의 메인 함수를 호출하는 HTTP API 엔드포인트를 정의
  - path: url 경로는 /notes
  - method: GET 요청
- **update**: update.js의 메인 함수를 호출하는 HTTP API 엔드포인트를 정의
  - path: url 경로는 /notes/{id} 
  - method: PUT 요청 
  - PUT 요청에 대한 핸들러를 `/notes/{id}` 엔드 포인트에 추가
- **delete**: delete.js의 메인 함수를 호출하는 HTTP API 엔드포인트
  - path: url 경로는 /notes/{id} 
  - method: DELETE 요청



#### Create 테스트

**mocks/create-event.json**

```json
{
  "body": "{\"content\":\"hello world\",\"attachment\":\"hello.jpg\"}",
  "requestContext": {
    "identity": {
      "cognitoIdentityId": "USER-SUB-1234"
    }
  }
}
```

**함수 호출**

```
$ npx serverless invoke local --function create --path mocks/create-event.json
```

자격증명이 여러 개인 경우.

```
$ AWS_PROFILE=myProfile serverless invoke local --function create --path mocks/create-event.json
```

- `myProfile`은 사용하고자 하는 AWS 프로필 이름이다.

**응답**

```
{
  "statusCode": 200,
  "headers": {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true
  },
  "body": "{\"userId\":\"USER-SUB-1234\",\"noteId\":\"308a1030-248b-11ea-a105-51e4bf325456\",\"content\":\"hello world\",\"attachment\":\"hello.jpg\",\"createdAt\":1576999082163}"
}
```

<br>

#### Get 테스트

Get note API를 테스트하려면`noteId` 매개 변수를 전달해야 한다. `create.js` 테스트를 통해 작성한 노트의 `noteId`를 사용하고`pathParameters` 블록을 모의 객체에 추가한다. () `id`의 값을 이전의 `create.js` 함수를 호출 할 때 받았던 ID로 대체)

**mocks/get-event.json**

```
{
  "pathParameters": {
    "id": "308a1030-248b-11ea-a105-51e4bf325456"
  },
  "requestContext": {
    "identity": {
      "cognitoIdentityId": "USER-SUB-1234"
    }
  }
}
```

**함수 호출**

```
$ npx serverless invoke local --function get --path mocks/get-event.json
```

**응답**

```json
{
  "statusCode": 200,
  "headers": {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true
  },
  "body": "{\"attachment\":\"hello.jpg\",\"content\":\"hello world\",\"createdAt\":1576999082163,\"noteId\":\"308a1030-248b-11ea-a105-51e4bf325456\",\"userId\":\"USER-SUB-1234\"}"
}
```

<br>

#### List 테스트

**mocks/list-event.json**

```js
{
  "requestContext": {
    "identity": {
      "cognitoIdentityId": "USER-SUB-1234"
    }
  }
}
```

**함수 호출**

```
$ npx serverless invoke local --function list --path mocks/list-event.json
```

**응답**

```json
{
  "statusCode": 200,
  "headers": {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true
  },
  "body": "[{\"attachment\":\"hello.jpg\",\"content\":\"hello world\",\"createdAt\":1576999082163,\"noteId\":\"308a1030-248b-11ea-a105-51e4bf325456\",\"userId\":\"USER-SUB-1234\"}]"
}
```

- 이 API는 단 하나의 노트 객체를 반환하는`get.js` 함수와 대조적으로 노트 객체의 배열을 반환한다.

<br>

#### Update 테스트

**mocks/update-event.json**

```json
{
  "body": "{\"content\":\"new world\",\"attachment\":\"new.jpg\"}",
  "pathParameters": {
    "id": "308a1030-248b-11ea-a105-51e4bf325456"
  },
  "requestContext": {
    "identity": {
      "cognitoIdentityId": "USER-SUB-1234"
    }
  }
}
```

- `pathParameters` 블록에 있는 `id` 는 이전에 사용했던 `noteId` 값으로 대체한다.

**함수 호출**

```
$ npx serverless invoke local --function update --path mocks/update-event.json
```

**응답**

```
{
  "statusCode": 200,
  "headers": {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true
  },
  "body": "{\"status\":true}"
}
```

<br>

#### Delete 테스트

**mocks/delete-event.json**

```json
{
  "pathParameters": {
    "id": "308a1030-248b-11ea-a105-51e4bf325456"
  },
  "requestContext": {
    "identity": {
      "cognitoIdentityId": "USER-SUB-1234"
    }
  }
}
```

**호출**

```
$ npx serverless invoke local --function delete --path mocks/delete-event.json
```

**응답**

```
{
  "statusCode": 200,
  "headers": {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true
  },
  "body": "{\"status\":true}"
}
```

<br>

## < Working with 3rd Party APIs >

3rd-party API와 함께 작동하는 엔드포인트를 작성하여 기존 API에 기능을 추가

비밀 환경 변수를 사용하는 방법과 Stripe을 사용하여 신용 카드 지불을 수락하는 방법에 대해서 진행.

일반적인 Serverless Stack의 확장 스택은 Stripe와 함께 작동하는 빌링 API를 추가하는 것. 노트 앱의 경우 사용자가 특정 수의 노트를 저장하는데 비용을 지불할 수 있게 된다.

```
1. 사용자는 저장하고자 하는 노트의 수를 선택하고 신용 카드 정보를 입력.
2. 프론트엔드에서 Stripe SDK를 호출하여 일회용 토큰을 생성하여 신용 카드 정보가 유효한지 확인.
3. 노트 수와 생성된 토큰을 전달하는 API를 호출.
4. API는 요금 책정 계획에 따라 노트 수를 가져오고 청구 할 금액을 파악한 다음, Stripe API에 요청하여 사용자에게 청구
```

<br>

#### Setup a Stripe Account

<https://dashboard.stripe.com/test/apikeys> 에서 `Publishable key` 와 `Secret key` 를 획득.

<br>

#### Add a Billing API

```
$ npm i strip
```

**billing.js**

```js
import stripePackage from "stripe";
import { calculateCost } from "./libs/billing-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  const { storage, source } = JSON.parse(event.body);
  const amount = calculateCost(storage);
  const description = "Scratch charge";

  // Load our secret key from the  environment variables
  const stripe = stripePackage(process.env.stripeSecretKey);

  try {
    await stripe.charges.create({
      source,
      amount,
      description,
      currency: "usd"
    });
    return success({ status: true });
  } catch (e) {
    return failure({ message: e.message });
  }
}
```

- 요청 본문에서 `storage` 와 `source`를 가져온다. `storage` 변수는 사용자가 자신의 계정에 저장하고자 하는 노트의 수 이며, `source`는 우리가 청구할 카드의 Stripe 토큰이다.
- `calculateCost(저장소)` 함수를 사용하여 저장 될 노트의 수를 기준으로 사용자에게 청구할 금액을 계산한다.
- Stripe Secret 키를 사용하여 새로운 Stripe 객체를 만든다. (환경 변수로 사용)
- 마지막으로 `stripe.charges.create()` 메소드를 사용하여 사용자에게 요금을 청구하고 모든 것이 성공적으로 완료되면 요청에 응답한다.

<br>

**libs/billing-lib.js**

```js
export function calculateCost(storage) {
  const rate = storage <= 10 ? 4 : (storage <= 100 ? 2 : 1);
  return rate * storage * 100;
}
```

- 기본적으로 사용자가 10 개 이하의 노트를 저장하려는 경우 노트 당 4 달러를 청구한다는 내용이다. 100 개 이하의 경우 2 달러를 청구하고 100 달러를 초과하는 항목은 노트 당 1 달러이다.

<br>

#### API 엔드포인트 구성

**serverless.yml**

```yaml
service: notes-app-api

package:
  individually: true

plugins:
  //...

provider:
  //...

functions:
  billing:
    # Defines an HTTP API endpoint that calls the main function in billing.js
    # - path: url path is /billing
    # - method: POST request
    handler: billing.main
    events:
      - http:
          path: billing
          method: post
          cors: true
          authorizer: aws_iam

# Create our resources with separate CloudFormation templates
resources:
  # API Gateway Errors
  - ${file(resources/api-gateway-errors.yml)}
```

<br>

#### Load Secrets from env

**.env**

```
STRIPE_SECRET_KEY=STRIPE_TEST_SECRET_KEY
```

- We are using the [serverless-dotenv-plugin](https://github.com/colynb/serverless-dotenv-plugin) to load these as an environment variable when our Lambda function runs locally. This allows us to reference them in our `serverless.yml`. We will not be commiting the `.env` file to Git as we are only going to use these locally. When we look at automating deployments, we’ll be adding our secrets to the CI, so they’ll be made available through there instead.

<br>

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
  //...
  # These environment variables are made available to our functions
  # under process.env.
  environment:
    tableName: notes
    stripeSecretKey: ${env:STRIPE_SECRET_KEY}

functions:
  //...

# Create our resources with separate CloudFormation templates
resources:
  # API Gateway Errors
  - ${file(resources/api-gateway-errors.yml)}
```

- The `STRIPE_SECRET_KEY` from the `.env` file above gets loaded as an environment variable when we test our code locally.
- This allows us to add a Lambda environment variable called `stripeSecretKey`. We do this using the `stripeSecretKey: ${env:STRIPE_SECRET_KEY}` line. And just like our `tableName` environment variable, we can reference it in our Lambda function using `process.env.stripeSecretKey`.

<br>

`.env` 를 gitignore 에 추가한다.

<br>

#### Test the Billing API

**mocks/billing-event.json**

```json
{
  "body": "{\"source\":\"tok_visa\",\"storage\":21}",
  "requestContext": {
    "identity": {
      "cognitoIdentityId": "USER-SUB-1234"
    }
  }
}
```

- `tok_visa`라는 Stripe 테스트 토큰과 저장하고자하는 노트의 수인 `21`을 테스트한다.

**함수 호출**

```
$ npx serverless invoke local --function billing --path mocks/billing-event.json
```

**응답**

```json
{
  "statusCode": 200,
  "headers": {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true
  },
  "body": "{\"status\":true}"
}
```

<br>

### < Unit Tests in Serverless >

현재 사용자들이 저장하고 싶은 노트의 수를 기반으로 사용자에게 청구할 금액을 정확하게 파악하는 간단한 비즈니스 로직을 작성한 상태. 사용자들에게 요금을 부과하기 전에 가능한 모든 케이스를 테스트 하려 한다.

Serverless Framework 프로젝트를 위한 단위 테스트를 구성할 것이며, **Jest**를 사용.

```
$ npm i -D jest
```

<br>

**tests/billing.test.js**

```js
import { calculateCost } from "../libs/billing-lib";

test("Lowest tier", () => {
  const storage = 10;

  const cost = 4000;
  const expectedCost = calculateCost(storage);

  expect(cost).toEqual(expectedCost);
});

test("Middle tier", () => {
  const storage = 100;

  const cost = 20000;
  const expectedCost = calculateCost(storage);

  expect(cost).toEqual(expectedCost);
});

test("Highest tier", () => {
  const storage = 101;

  const cost = 10100;
  const expectedCost = calculateCost(storage);

  expect(cost).toEqual(expectedCost);
});
```

- 단위 테스트는 매우 간단해야한다. 여기서는 3 개의 테스트를 추가한 상태. 
- 이 테스트들은 가격 체계의 여러 단계를 테스트를 한다. 
- 사용자가 10, 100 및 101 개의 노트를 저장하려고 하는 경우를 테스트하고, 계산된 비용을 우리가 기대하는 것과 비교한다.
- Jest Docs : <https://jestjs.io/docs/en/getting-started.html>

<br>

#### 테스트 실행

**package.json**  sciprt 추가 후 실행.

```json
"scripts": {
  "test": "serverless-bundle test",
  //...
},
```

```
$ npm test
```

#### 실행결과

```
> serverless-bundle test

 PASS  tests/billing.test.js
  ✓ Lowest tier (3ms)
  ✓ Middle tier (1ms)
  ✓ Highest tier

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        2.36s
Ran all test suites.
```

<br>

### < Handle API Gateway CORS Errors >

API를 배포하기 전에 마지막으로 설정할 일은 CORS 헤더를 API Gateway 오류에 추가하는 일이다. 

이전 함수코드에서 람다 함수에 CORS 헤더를 추가했는데, 사실 API 를 요청할 때, API Gateway는 Lambda 함수 전에 호출된다. 즉, API Gateway 수준에서 오류가 발생하면 CORS 헤더가 설정되지 않는다. 

Consequently, debugging such errors can be really hard. Our client won’t be able to see the error message and instead will be presented with something like this: 

```
No 'Access-Control-Allow-Origin' header is present on the requested resource
```

CORS 관련 오류는 가장 일반적인 Serverless API 오류 중 하나이다. 여기서는 HTTP 오류가있는 경우 CORS 헤더를 설정하도록 API Gateway를 구성하려고 한다. (당장은 이를 테스트 할 수 없지만, 프론트 엔드 클라이언트에서 작업 할 때 정말 도움이 된다.)

<br>

#### 리소스 만들기

API Gateway 오류를 구성하기 위해 우리는`serverless.yml`에 몇 가지를 추가해야한다. 기본적으로 Serverless Framework 는 **CloudFormation**을 지원하므로 코드를 통해 API Gateway를 구성 할 수 있습니다.

**resources/api-gateway-errors.yml**

```yaml
Resources:
  GatewayResponseDefault4XX:
    Type: 'AWS::ApiGateway::GatewayResponse'
    Properties:
      ResponseParameters:
         gatewayresponse.header.Access-Control-Allow-Origin: "'*'"
         gatewayresponse.header.Access-Control-Allow-Headers: "'*'"
      ResponseType: DEFAULT_4XX
      RestApiId:
        Ref: 'ApiGatewayRestApi'
  GatewayResponseDefault5XX:
    Type: 'AWS::ApiGateway::GatewayResponse'
    Properties:
      ResponseParameters:
         gatewayresponse.header.Access-Control-Allow-Origin: "'*'"
         gatewayresponse.header.Access-Control-Allow-Headers: "'*'"
      ResponseType: DEFAULT_5XX
      RestApiId:
        Ref: 'ApiGatewayRestApi'
```

- 위 구문은 CloudFormation 리소스를 나타낸다. 그러나 여기서의 세부 사항은 그다지 중요하지 않다. 
- `GatewayResponseDefault4XX`는 4xx 에러를 위한 것이고,`GatewayResponseDefault5XX`는 5xx 에러를 위한 것.

<br>

#### 리소스 포함시키기

**serverless.yml**

```yaml
service: notes-app-api

package:
  individually: true

plugins:
  //...

provider:
  //...

functions:
  //...

# Create our resources with separate CloudFormation templates
resources:
  # API Gateway Errors
  - ${file(resources/api-gateway-errors.yml)}
```

<br>

### < Deploy the APIs >

```
$ serverless deploy
```

AWS SDK를 위해 여러개의 프로파일을 가지고 있는 경우.

```
$ serverless deploy --aws-profile myProfile
```

배포 시 하단에서 **서비스 정보**를 확인할 수 있다.

```
Serverless: DOTENV: Loading environment variables from .env:
Serverless: 	 - STRIPE_SECRET_KEY
Serverless: Bundling with Webpack...
Serverless: Packaging service...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service create.zip file to S3 (81.83 KB)...
Serverless: Uploading service get.zip file to S3 (77.54 KB)...
Serverless: Uploading service list.zip file to S3 (77.54 KB)...
Serverless: Uploading service billing.zip file to S3 (144.22 KB)...
Serverless: Uploading service delete.zip file to S3 (77.34 KB)...
Serverless: Uploading service update.zip file to S3 (78.04 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
....................................................................
Serverless: Stack update finished...
Service Information
service: notes-app-api
stage: prod
region: us-east-1
stack: notes-app-api-prod
resources: 43
api keys:
  None
endpoints:
  POST - https://ultn4xzava.execute-api.us-east-1.amazonaws.com/prod/notes
  GET - https://ultn4xzava.execute-api.us-east-1.amazonaws.com/prod/notes/{id}
  GET - https://ultn4xzava.execute-api.us-east-1.amazonaws.com/prod/notes
  PUT - https://ultn4xzava.execute-api.us-east-1.amazonaws.com/prod/notes/{id}
  DELETE - https://ultn4xzava.execute-api.us-east-1.amazonaws.com/prod/notes/{id}
  POST - https://ultn4xzava.execute-api.us-east-1.amazonaws.com/prod/billing
functions:
  create: notes-app-api-prod-create
  get: notes-app-api-prod-get
  list: notes-app-api-prod-list
  update: notes-app-api-prod-update
  delete: notes-app-api-prod-delete
  billing: notes-app-api-prod-billing
layers:
  None
Serverless: Run the "serverless" command to setup monitoring, troubleshooting and testing.
```

- 작성된 API 엔드포인트 목록을 확인할 수 있다.
- 엔드포인트에서 `us-east-1`은 API 게이트웨이 리전이고, `ultn4xzava`는 API 게이트웨이 ID 이다.

<br>

#### 단일 함수 배포

모든 함수를 배포하지 않고 하나의 API 엔드포인트만을 배포하려는 경우,  `serverless deploy function` 명령은 전체 배포주기를 거치지 않고 개별 기능을 배포한다. 변경 한 사항만을 배포하는 훨씬 빠른 방법이다.

```
$ serverless deploy function -f list
```

