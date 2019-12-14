const fs = require('fs');
const AWS = require('aws-sdk');
const gm = require('gm').subClass({imageMagick: true}); // Enable ImageMagick integration.
const util = require('util');

// constants
const MAX_WIDTH = 700;
const MAX_HEIGHT = 700;

// get reference to S3 client 
const s3 = new AWS.S3();

const saveFirstFrame = ({Body}, fileName) => {
  return new Promise((resolve, reject) => {
    gm(Body).selectFrame(0).write(`/tmp/${fileName}.png`, (err) => { 
      err ? reject(err) : resolve();
    })
  })
};

const transform = (fileName, imageType, {ContentType}) => {
  return new Promise((resolve, reject) => {
    gm(`/tmp/${fileName}.png`).size(function (err, size) {
      // Infer the scaling factor to avoid stretching the image unnaturally.
      const scalingFactor = Math.min(MAX_WIDTH / size.width, MAX_HEIGHT / size.height);
      const width = scalingFactor * size.width;
      const height = scalingFactor * size.height;

      // Transform the image buffer in memory.
      this.resize(width, height).toBuffer(imageType, function (err, buffer) {
        err ? reject(err) : resolve({ContentType, buffer});
      });
    });
  });
};

exports.handler = async (event) => {
    // Read options from the event.
    console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
    const srcBucket = event.Records[0].s3.bucket.name;
    
    // Object key may have spaces or unicode non-ASCII characters.
    const srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

    const typeMatch = srcKey.match(/\.([^.]*)$/);
    if (!typeMatch) {
      console.log('Could not determine the image type.');
      return ;
    }

    const [key, imageType] = srcKey.split('.');
    const keys = key.split('/');
    const fileName = keys[keys.length-1];
    
    // Infer the image type.
    if (imageType.toLocaleLowerCase() != 'gif') {
      console.log(`Unsupported image type: ${imageType}`);
      return ;
    }

    try {
      const response = await s3.getObject({ Bucket: srcBucket, Key: srcKey}).promise();
      await saveFirstFrame(response, fileName);
      const {ContentType, buffer} = await transform(fileName, imageType, response);
      await s3.putObject({
        Bucket: srcBucket,
        Key: `${key}.png`,
        Body: buffer,
        ContentType
      }).promise();

      console.log(
        'Successfully extracted 1st Frame of ' + srcBucket + '/' + srcKey +
        ' and uploaeded to ' + srcBucket + '/' + `${fileName}.png`
      );
    } catch (e) {
      console.log('fail to extract >> ', e);
    }

    return ;
};

