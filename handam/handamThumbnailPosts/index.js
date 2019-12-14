//const util = require('util');
const AWS = require('aws-sdk');
const gm = require('gm').subClass({imageMagick: true}); // Enable ImageMagick integration.

// constants
const MAX_WIDTH = 500;
const MAX_HEIGHT = 500;

// get reference to S3 client 
const s3 = new AWS.S3();

const saveFirstFrame = ({Body}, fileName) => {
    return new Promise((resolve, reject) => {
        gm(Body).selectFrame(0).write(`/tmp/${fileName}.png`, (err) => { 
            err ? reject(err) : resolve();
        });
    });
};

const transformGIF = (fileName, imageType) => {
    return new Promise((resolve, reject) => {
        gm(`/tmp/${fileName}.png`).size(function (err, size) {
            if(err) reject(err);
            else {
                // Infer the scaling factor to avoid stretching the image unnaturally.
                const scalingFactor = Math.min(MAX_WIDTH / size.width, MAX_HEIGHT / size.height);
                const width = scalingFactor * size.width;
                const height = scalingFactor * size.height;
        
                // Transform the image buffer in memory.
                this.resize(width, height).toBuffer(imageType, function (err, buffer) {
                    err ? reject(err) : resolve(buffer);
                });
            }
        });
    });
};

const transform = (imageType, {Body}) => {
    return new Promise((resolve, reject) => {
        gm(Body).size(function (err, size) {
            if(err) reject(err)
            else {
                const scalingFactor = Math.min(MAX_WIDTH / size.width, MAX_HEIGHT / size.height);
                const width = scalingFactor * size.width;
                const height = scalingFactor * size.height;

                if(imageType !== 'gif') {
                    this.resize(width, height);
                }

                this.toBuffer(imageType, (err, buffer) => {
                    err ? reject(err) : resolve(buffer);
                });
            }
        });
    });
}

exports.handler = async (event) => {
    // Read options from the event.
    //console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
    const Bucket = event.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    const Key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));
    const resizedKey = `resized-${Key}`;

    const [key, ext] = Key.split('.');
    const keys = key.split('/');
    const fileName = keys[keys.length-1]

    // Infer the image type.
    const typeMatch = Key.match(/\.([^.]*)$/);
    if (!typeMatch) {
        console.log("Could not determine the image type.");
        return ;
    }

    const imageType = ext.toLocaleLowerCase();
    if(imageType !== 'jpg' && imageType !== 'jpeg' && imageType !== 'png' && imageType !== 'gif' ) {
        console.log(`Unsupported image type: ${imageType}`);
        return ;
    }

    try { // Get the image from S3, transform, and upload to a different S3 bucket.
        const response = await s3.getObject({ Bucket, Key }).promise();
        const s3d = s3.deleteObject({ Bucket, Key }).promise();
        const {ContentType} = response;
        
        let s3pPng;
        if(imageType === 'gif') {
            await saveFirstFrame(response, fileName);
            const Body = await transformGIF(fileName, imageType, response);
            s3pPng = s3.putObject({ Bucket, Key: `resized-${key}.png`, Body, ContentType }).promise();
        }
        const Body = await transform(imageType, response);
        const s3p = s3.putObject({ Bucket, Key: `${resizedKey}`, Body, ContentType }).promise(); 

        if(imageType === 'gif') {
            await s3pPng;
        }
        await s3p; await s3d;

        console.log(`Successfully resized${Bucket}/${Key} and uploaded to ${Bucket}/${resizedKey}`);
    } catch (e) {
        console.log('fail to resize >> ', e);
    }

    return ;
}
