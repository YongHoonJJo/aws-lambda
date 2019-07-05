import json
from gensim.models import Word2Vec

def lambda_handler(event, context):
    
    size = event['size']
    result = []

    for i in range(size):
        result.append(event[str(i)])

    model = Word2Vec(sentences=result, size=10, window=5, min_count=5, workers=4, sg=0)

    vec_dict = dict({})
    for idx, key in enumerate(model.wv.vocab):
        vec_dict[key] = model.wv[key].tolist()

    print(vec_dict)
    return json.dumps(vec_dict)
