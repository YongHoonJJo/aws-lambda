
export const createParseRule_ID = (rule) => {
  if(!rule) return

  const { ruleID } = rule
  const ruleIdL = ruleID.toLowerCase()
  const ret = rule.RHSs.map(r => `${ruleIdL}${r.toLowerCase()}`)
  ret.push(ruleIdL)

  return ret
}

export const createParseRule = (rules=[], fname='N-rule1') => {

  const num = fname.split('rule')[1]
  // const parseRuleID = rules.map(r => createParseRule_ID(r))

  const ret = [
    `#ifndef _H_RNAME${num}`,
    `#define _H_RNAME${num}`,
    ``,
    `extern int RemoveRules${num};`,
    `extern int LongRemoveRules${num};`,
    `extern int NumOfRemoveRules${num};`,
    `extern int NumOfLongRemoveRules${num};`,
    ``,
    `enum ParseRule_ID${num} {`,
    `\tnp010noun=0, np010,`,
    `};`,
    ``,
    `#define MaxRuleNum${num} 146`,
    ``,
    `#endif`,
    ``
  ]

  // console.log(ret.join('\n'))
}