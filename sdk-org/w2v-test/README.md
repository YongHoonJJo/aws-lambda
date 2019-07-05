#### w2v-test



##### Settings

```
$ mkdir w2v-test
$ cd w2v-test
$ vi app.py
$ virtualenv venv --python=python3.6
$ source venv/bin/activate

(venv) $ pip install gensim
(venv) $ deactivate
```

<br>

#### 패키징

불필요한 패키지들까지 패키징하면 람다함수의 용량제한에 걸리게 된다.

```
gensim
numpy
scipy

smart_open
boto
requests
urllib3
chardet
certifi
idna
```

> 위의 패키지들만 압축해서 app.py 파일과 같이 S3 로 올린 다음 람다 함수코드를 해당 S3에서 불러오면 된다. 

<br>

##### Reference

Word2Vec Tutorial : <https://wikidocs.net/22660>