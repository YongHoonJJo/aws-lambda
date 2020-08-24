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
  return ret.trim()
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
  return Object.entries(ret)
    .map(([k, v]) => ({[k.trim()]: v.trim()}))
    .reduce((a, b) => ({...a, ...b}), {})
}

exports.main = async (event) => {
  const {filename} = event.pathParameters
  const Bucket = 'rule-compiler'
  const Key = `N-rules/${filename}.txt`

  try {
    const { Body } = await s3.getObject({ Bucket, Key }).promise();
    const data = Body.toString('utf-8');

    console.log({data})

    const nData = data
      .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
      .replace(/[\/\/|\t+]/g, ' ')
      .replace(/(\r\n)+/g, ' ')
      .replace(/ +/g, ' ')

    const [rule1, ...rest] = nData.split(':')
    const [last] = rest.splice(-1)
    console.log({rule1})
    let rule = rule1.trim()
    const res = {}
    rest.forEach(r => {
      const d = r.trim().split(' ')
      const [ru] = d.splice(-1)
      const contents = d.join(' ')
      const [RHSs, LHS] = contents.split(' -> ')
      const rhsConditions = sepRHSsConditions(RHSs)
      res[rule] = { // replace(/\([^)]+\)/ig, '')
        // RHSs: RHSs.replace(/\([^)]+\)/ig, '').split(' '),
        RHSs: Object.keys(rhsConditions),
        LHS: LHS.replace(/\([^)]+\)/ig, '').trim(),
        contents: contents.trim(),
        // rhsConditions: sepRHSsConditions(RHSs),
        rhsConditions,
        lhsAction: sepLHSAction(LHS),
        ruleID: rule.trim(),
        filename
      }
      rule = ru
    })
    const contents = last.trim()
    const [RHSs, LHS] = contents.split(' -> ')
    const rhsConditions = sepRHSsConditions(RHSs)
    res[rule] = {
      // RHSs: RHSs.replace(/\([^)]+\)/ig, '').split(' '),
      RHSs: Object.keys(rhsConditions),
      LHS: LHS.replace(/\([^)]+\)/ig, '').trim(),
      contents: contents.trim(),
      // rhsConditions: sepRHSsConditions(RHSs),
      rhsConditions,
      lhsAction: sepLHSAction(LHS),
      ruleID: rule.trim(),
      filename
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
