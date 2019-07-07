### < Serverless Framework >

Serverless Framework Basic Tutorial

#### Create

```
> sls create -t aws-nodejs -n sample-app -p sampleApp
> cd sampleApp
> ls
handler.js     serverless.yml     .gitignore
```

> `sis create —help` 를 치면 다양한 내용을 확인할 수 있다.

<br>

```yaml
### serverless.yml ###
service: sample-app 

provider:
  name: aws
  runtime: nodejs8.10

functions:
  hello:
    handler: handler.hello
```

> `handler.js` 파일에 있는 `hello` 함수를 핸들러로 사용.

<br>

#### Package

```
> sls package
> ls
.gitignore     .serverless      handler.js     serverless.yml
```

> `.serverless` 디렉토리가 생긴다. 

<br>

`.serverless` 는 아래와 같이 구성되어 있다

```
- .serverless
  ㄴ cloudformation-template-create-stack.json 
  ㄴ cloudformation-template-update-stack.json 
  ㄴ sample-app.zip
  ㄴ serverless-state.json
```

> `sample-app.zip` 에는 sampleApp 의 artifact 즉, handler.js 가 들어간다.
>
> 또한, CloudFormation-template 이 포함되어 있는데, serverless 가 내부적으로 cloudFormation 으로 변환을 시켜준다. 내용은 S3 버킷에 소스를 올리고, 람다에서 해당 소스를 받아오겠다는 내용이 들어있다.
>
> serverless-state 에서는 state 를 관리해준다. 어떤 설정이 변경되었는지 등.

<br>

#### Deploy

```
> sls deploy
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
.....
Serverless: Stack create finished...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service sample-app.zip file to S3 (1.21 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
...............
Serverless: Stack update finished...
Service Information
service: sample-app
stage: dev
region: us-east-1
stack: sample-app-dev
resources: 5
api keys:
  None
endpoints:
  None
functions:
  hello: sample-app-dev-hello
layers:
  None
```

> serverless.yml 에서 region 에 대한 설정이 없었기 때문에, default 로 us-east-1 에 배포가 되었다. 

<br>

AWS 의 Lambda 및 CloudFormation 서비스로 이동하면 각각 배포된 내용 및 어떠한 이벤트들이 발생했는지 확인할 수 있다.

<br>

#### Remove

Deploy 한 것을 내리고 싶을 때.

cloudformation 에서 스택을 삭제 하거나 `sls remove` 명령어를 통해 가능하다.

```
> sls remove
Serverless: Getting all objects in S3 bucket...
Serverless: Removing objects in S3 bucket...
Serverless: Removing Stack...
Serverless: Checking Stack removal progress...
..........
Serverless: Stack removal finished...
```

<br>

#### Invoke

배포하기 전 로컬에서 실행해볼 때 사용

```
> sls invoke local --function hello
{
    "statusCode": 200,
    "body": "{\"message\":\"Go Serverless v1.0! Your function executed successfully!\",\"input\":\"\"}"
}
```

> hello 는 function name 에 해당한다. 







#### Debug

```
> export SLS_DEBUG=*
> sls invoke local --function hello
```

> 만약 위의 명령어로 에러가 발생하면, 위와 같이 설정 후 다시 실행해보면 로그를 확인할 수 있다. 

<br>

문제를 해결하고 나면 환경변수를 다시 설정해주면 된다.

```
> export SLS_DEBUG=
```



<br>

#### Reference

<https://github.com/novemberde/serverless-todo-demo>