### Todo Web Client

Lambda와 Express.js로 만든 RESTful API에 요청을 날리고 받아오는 웹 클라이언트 (React 기반)

<br>

#### 소스코드 다운 및 패키지 설치

```
> git clone https://github.com/novemberde/serverless-todo-demo.git
> cd static-web-front
> yarn install
```

<br>

#### Bundling (using parcel)

```
> npm start
```

> 번들링된 결과가 dist 폴더 안에 생성된다.

#### base URL 설정

App.js 에서 baseURL 에 기존에 배포한 서버의 주소를 입력한다. (핫로딩으로 재빌드 된다.)

서버의 주소는 AWS - APIGATEWAY - 배포된 API 의 스테이지에서 확인 가능하다.

<br>

#### S3를 통해 Static Web Site를 호스팅하기

S3에 번들링된 파일 업로드

```
> cd dist
> aws s3 cp ./ s3://yonghoon-serverless-static-web/ --recursive --acl public-read
```

> —recursive 옵션은 디렉토리 안에 있는 것들까지 모두 올리겠다는 뜻.
>
> —acl public-read 는 읽기 권한을 부여. 이 파일에 접근하는 사용자는 이 파일을 모두 볼 수 있게 된다.

<br>

버킷의 속성 - 정적 웹 사이트 호스팅 설정.

<br>

#### Reference

<https://github.com/novemberde/serverless-todo-demo>