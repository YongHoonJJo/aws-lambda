const aws = require('aws-sdk');
const s3 = new aws.S3();

const sepLHSAction = action => {
  let ret = '', toOpen = true

  for(const s of action) {
    if(s === '(') {
      toOpen = false
    } else if(s === ')') {

    } else {
      if(!toOpen) { ret = `${ret}${s}` }
    }
  }
  // console.log({ret})
  return ret
}

const sepRHSsConditions = RHSsCondi => {
  const ret = {}
  let rhs = '', condi = '', toOpen = true
  const cds = RHSsCondi.replace(/\) /ig, ')')

  for(const s of cds) {
    if(s === '(') {
      toOpen = false
    } else if(s === ')') {
      ret[rhs] = condi
      rhs = ''
      condi = ''
      toOpen = true
    } else {
      if(toOpen) { rhs = `${rhs}${s}` }
      else { condi = `${condi}${s}` }
    }
  }
  // console.log({ret})
  return ret
}

exports.main = async (event) => {
  const {filename} = event.pathParameters
  const Bucket = 'rule-compiler'
  const Key = `N-rules/${filename}.txt`

  try {
    // const { Body } = await s3.getObject({ Bucket, Key }).promise();
    // console.log({filename, event})
    const data = JSON.parse(event.body)
    // console.log({filename, data})

    const result = Object.keys(data).map(k => {
      const { contents, ruleID, LHS, RHSs } = data[k]
      const [cRHSs, cLHS] = contents.split(' -> ')
      const rhsConditions = sepRHSsConditions(cRHSs)
      const lhsAction = sepLHSAction(cLHS)
      const rhsStr = RHSs.map(r => `${r}(${rhsConditions[r]})`).join('\n  ')

      return [
        `${ruleID}:`,
        `  ${rhsStr}`,
        `->`,
        `\t${LHS}(${lhsAction})`,
        ``
      ].join('\r\n')
    }).join('\r\n')

    const s3Params = {
      Bucket,
      Key,
      Body: `\r\n${result}`,
      ContentType: 'text/plain'
    }
    await s3.putObject(s3Params).promise();

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true
      },
      // body: JSON.stringify(res),
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
