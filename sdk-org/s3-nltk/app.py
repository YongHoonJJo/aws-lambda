import re
import imp
import sys

# since libsqlite3-dev is not installed in container running lambda
# this workaround of creating dummy empty modules is needed
sys.modules["sqlite"] = imp.new_module("sqlite")
sys.modules["sqlite3.dbapi2"] = imp.new_module("sqlite.dbapi2")

import nltk
from nltk.tokenize import word_tokenize, sent_tokenize

import boto3
import os
import uuid
import json

s3_client = boto3.client('s3')
lam = boto3.client('lambda')

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

    print(result)
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
        print(response)
        return response['Payload'].read()
    except Exception as e:
        print(e)
        raise e


def save_text(text, path):
    f = open(path, 'w')
    f.write(text)
    f.close()
    
def lambda_handler(event, context): 

    parse_text = ''

    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key'] 
        download_path = '/tmp/{}{}'.format(uuid.uuid4(), key)
        upload_path = '/tmp/vector-{}'.format(key)

        s3_client.download_file(bucket, key, download_path)
        parse_text = get_text(download_path)
        result = tokenize(parse_text)
        res = lambda_invoke(result)
        vec_dict_str = res.decode('ascii')
        save_text(vec_dict_str, upload_path)
        s3_client.upload_file(upload_path, '{}-vector'.format(bucket), key)

