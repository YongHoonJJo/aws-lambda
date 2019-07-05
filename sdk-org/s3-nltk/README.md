#### S3-NLTK



##### Description

```
1. S3에 txt 파일 업로드
2. Lambda function 호출
3. 임시 디렉토리에 저장
4. text 내용을 string 으로 저장
5. string을 tokenize
6. tokenized 된 결과를 w2v-test 람다함수에게 처리 요청
7. 응답 결과를 텍스트 파일로 저장 후 다시 S3 에 업로드
```

<br>

##### Settings

```
$ mkdir s3-nltk
$ cd s3-nltk
$ virtualenv venv --python=python3.6
$ source venv/bin/activate

(venv) $ pip install nltk boto3
(venv) $ deactivate
```



<br>

##### 인터프리터 실행 후 punkt 다운로드

```
Resource punkt not found.
  Please use the NLTK Downloader to obtain the resource:

  >>> import nltk
  >>> nltk.download('punkt')
```

> 사용자 홈 디렉토리에 `nltk-data` 디렉토리가 생성됨.

<br>

##### Lambda 함수에서 환경변수 설정

![https://i.stack.imgur.com/SWl1E.png](https://i.stack.imgur.com/SWl1E.png)

<https://stackoverflow.com/questions/42382662/using-nltk-corpora-with-aws-lambda-functions-in-python>

<br>

##### 패키징

NLTK, boto3 패키지 압축 : 패키지가 설치된 디렉토리로 이동 후 `zip -r9 <dist-path/filename.zip> .` 실행

filename.zip 에 `app.py` 파일 및 사용자 홈 디렉토리에 설치된 nltk_data 디렉토리 포함시키기. 

`zip -g filename.zip <포함시킬 파일 path>`



<br>

##### S3 에 업로드 

```
$ aws s3 cp filename.zip s3://<bucket-name>
```



<br>

##### Lambda Invoke, S3 접근, Log 를 위한 Policy

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:*"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": "arn:aws:s3:::*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "lambda:invokeFunction"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}
```



<br>

##### Reference

API Invoke : <https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/API_Invoke.html>

NLTK _sqlite3 이슈 :  <https://smirnov-am.github.io/using-nltk-library-with-aws-lambda/>

개발환경(Amazon Linux) : <https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/lambda-runtimes.html>

파이썬 가상환경 : <https://docs.aws.amazon.com/ko_kr/lambda/latest/dg/lambda-python-how-to-create-deployment-package.html#python-package-venv>

효율적인 string concat : <https://blog.leekchan.com/post/19062594439/python에서-효율적인-string-concatenation-방법>

