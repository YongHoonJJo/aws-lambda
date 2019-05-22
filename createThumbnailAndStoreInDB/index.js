// dependencies
const AWS = require('aws-sdk');
const gm = require('gm').subClass({ imageMagick: true }); // Enable ImageMagick integration.
const util = require('util');

// constants
const DEFAULT_MAX_WIDTH  = 200;
const DEFAULT_MAX_HEIGHT = 200;
const DDB_TABLE = 'images';

// get reference to AWS services client
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB();

const getImageType = (key) => {
  const typeMatch = key.match(/\.([^.]*)$/);
  if (!typeMatch) {
      console.log("Could not determine the image type for key: ${key}");
      return null;
  }
  const imageType = typeMatch[1];
  if (imageType != "jpg" && imageType != "png") {
      console.log('Unsupported image type: ${imageType}');
      return null;
  }
  return imageType;
}

const tranformImage = ({Body, Metadata, ContentType}, imageType) => {
  return new Promise((resolve, reject) => {
    gm(Body).size(function(err, size) {
      if(err) return reject(err);

      const metadata = Metadata;
      //console.log("Metadata:\n", util.inspect(metadata, {depth: 5}));
      
      const max_width = 'width' in metadata ? metadata.width : DEFAULT_MAX_WIDTH;
      const max_height = 'height' in metadata ? metadata.height : DEFAULT_MAX_HEIGHT;
      
      // Infer the scaling factor to avoid stretching the image unnaturally.
      const scalingFactor = Math.min(
        max_width / size.width,
        max_height / size.height
      );

      const width  = scalingFactor * size.width;
      const height = scalingFactor * size.height;
  
      // Transform the image buffer in memory.
      this.resize(width, height).toBuffer(imageType, (err, buffer) => {
        err ? reject(err) : resolve({ContentType, metadata, buffer});
      });
    });
  });
}

exports.handler = async (event) => {
  // Read options from the event.
  console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
  const srcBucket = event.Records[0].s3.bucket.name;
  const srcKey    = event.Records[0].s3.object.key;
  const dstBucket = srcBucket;
  const dstKey    = "thumbs/" + srcKey;

  const imageType = getImageType(srcKey);
  if(imageType == null) return ;

  // Download the image from S3, transform, upload to a different S3 bucket
  // and write the metadata to DynamoDB
  try {
    // Download the image from S3 into a buffer.
    const response = await s3.getObject({ Bucket: srcBucket, Key: srcKey }).promise();
    //console.log('response >> ', response)
    const {ContentType, metadata, buffer} = await tranformImage(response, imageType);
    await s3.putObject({
      Bucket: dstBucket,
      Key: dstKey,
      Body: buffer,
      ContentType: ContentType,
      Metadata: metadata
    }).promise(); 

    const params = {
      TableName: DDB_TABLE,
      Item: {
        name: { S: srcKey },
        thumbnail: { S: dstKey },
        timestamp: { S: (new Date().toJSON()).toString() },
      }
    };

    ['author', 'title', 'description'].forEach(key => {
      if(key in metadata) params.Item[key] = { S: metadata[key] }
    })

    await dynamodb.putItem(params).promise();

    console.log(
      'Successfully resized ' + srcBucket + '/' + srcKey +
      ' and uploaded to ' + dstBucket + '/' + dstKey
    );
  } catch (error) {
    console.log('errer >> ', error)
  }
};