
import boto3
s3_client = boto3.client('s3')

def lambda_handler(event, context):
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key'] 
        download_path = '/tmp/{}'.format(key)
        s3_client.download_file(bucket, key, download_path)

        acc_bucket = 'word-vector-text-acc'
        acc_key = 'acc-result.txt'
        acc_download_path = '/tmp/tmp-{}'.format(acc_key)
        s3_client.download_file(acc_bucket, acc_key, acc_download_path)
    
        filenames = [download_path, acc_download_path]
        filename = '/tmp/{}'.format(acc_key)
        with open(filename, 'w') as outfile:
            for fname in filenames:
                with open(fname) as infile:
                    for line in infile:
                        outfile.write(line)

        s3_client.upload_file(filename, acc_bucket, acc_key)
    
