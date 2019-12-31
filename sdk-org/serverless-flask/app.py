import re
import json
from flask import Flask, request
from flask_cors import CORS

import nltk
from nltk.tokenize import word_tokenize, sent_tokenize

import boto3
s3_client = boto3.client('s3')
lam = boto3.client('lambda')

app = Flask(__name__)

CORS(app)

@app.route("/")
def hello():
    return "Hello World!"

def get_text(download_path):
    str_list = []
    f = open(download_path, 'r')
    while True:
        line = f.readline()
        if not line: break
        str_list.append(line)
    f.close()
    return ''.join(str_list)

def tokenize(parse_text):
    content_text = re.sub(r'\([^)]*\)', '', parse_text)

    sent_text=sent_tokenize(content_text)

    normalized_text = []
    for string in sent_text:
        tokens = re.sub(r"[^a-z0-9]+", " ", string.lower())
        normalized_text.append(tokens)

    result=[]
    result=[word_tokenize(sentence) for sentence in normalized_text]

    #print('tokenize > ', result)
    return result

def lambda_invoke(text_lists):
    # list to dict
    list_len = len(text_lists) 
    payload = dict(zip(range(list_len), text_lists))
    payload['size'] = list_len
    
    try:
        response = lam.invoke(FunctionName='w2v-test',
                    InvocationType='RequestResponse',
                    Payload=json.dumps(payload))
        #print('response > ', response)
        return response['Payload'].read()
    except Exception as e:
        print('e > ', e)
        raise e

def upload_text(text_list, filename):
    #print('text_list > ', text_list)
    upload_path = '/tmp/tokenized-{}'.format(filename)
    with open(upload_path, 'w') as f:
        for line in text_list:
            f.write(' '.join(line) + '\n')

    bucket = 'word-vector-text'
    s3_client.upload_file(upload_path, bucket, filename)

@app.route("/wordVector", methods=["POST"])
def create_word_vector():
    rf = request.files["file"]
    download_path = '/tmp/{}'.format(rf.filename)
    rf.save(download_path)

    parse_text = get_text(download_path)
    result = tokenize(parse_text)
    upload_text(result, rf.filename)
    
    word_vec = lambda_invoke(result)
    #print('word_vec > ', word_vec.decode('ascii'))
    return word_vec.decode('ascii')


@app.route("/getAccVector")
def getAccVector():
    bucket = 'word-vector-text-acc'
    key = 'vector-result.txt'
    download_path = '/tmp/{}'.format(key)
    s3_client.download_file(bucket, key, download_path)

    acc_vector = ''
    with open(download_path) as f:
        acc_vector = f.read()

    return eval(acc_vector)
    #return "getAccVector"

if __name__ == '__main__':
  app.run()
