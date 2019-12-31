import boto3
s3_client = boto3.client('s3')

import json
from gensim.models import Word2Vec

def lambda_handler(event, context):
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key'] 
        download_path = '/tmp/{}'.format(key)
        s3_client.download_file(bucket, key, download_path)
        
        sentences = []
        with open(download_path, 'r') as f:
            sentences = f.read().splitlines()

        for idx, sentence in enumerate(sentences):
            sentences[idx] = sentence.split(' ')
                
        model = Word2Vec(sentences, size=10, window=5, min_count=4, workers=4, sg=0)

        vec_dict = dict({})
        for idx, key in enumerate(model.wv.vocab):
            vec_dict[key] = model.wv[key].tolist()

        new_key = 'vector-result.txt'
        upload_path = '/tmp/{}'.format(new_key)
        with open(upload_path, 'w') as f:
            f.write(str(vec_dict))

        s3_client.upload_file(upload_path, bucket, new_key)
        print(vec_dict)
        #return json.dumps(vec_dict)
