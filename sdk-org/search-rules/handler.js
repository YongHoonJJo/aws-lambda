const aws = require('aws-sdk');
const s3 = new aws.S3();

exports.main = async (event) => {
  const {filename} = event.pathParameters
  const Bucket = 'rule-compiler' 
  const Key = `rules/${filename}.txt` 
  
  try {
    const { Body } = await s3.getObject({ Bucket, Key }).promise();
    const data = Body.toString('utf-8');
    
    const nData = data
      .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
      .replace(/[\/\/|\t+]/g, ' ')
      .replace(/(\r\n)+/g, ' ')
      .replace(/ +/g, ' ')
    
    const [rule1, ...rest] = nData.split(':')
    const [last] = rest.splice(-1)
    
    let rule = rule1.trim()
    const res = {}
    rest.forEach(r => {
      const d = r.trim().split(' ')
      const [ru] = d.splice(-1)
      const contents = d.join(' ')
      const [RHSs, LHS] = contents.split(' -> ')
      res[rule] = { // replace(/\([^)]+\)/ig, '')
        RHSs: RHSs.replace(/\([^)]+\)/ig, '').split(' '), 
        LHS: LHS.replace(/\([^)]+\)/ig, ''), 
        contents,
        ruleID: rule
      }
      rule = ru
    })
    const contents = last.trim()
    const [RHSs, LHS] = contents.split(' -> ')
    res[rule] = { 
      RHSs: RHSs.replace(/\([^)]+\)/ig, '').split(' '), 
      LHS: LHS.replace(/\([^)]+\)/ig, ''), 
      contents,
      ruleID: rule
    }
    
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      body: JSON.stringify(res),
    };
    return response;
  } catch(e) {
    console.log({e})
    return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify('Error')
    }
  }
};
