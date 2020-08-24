import {createRule} from "./ruleN-cpp";

const ParseRuleID = (rule, enumS, idx) => {
  if(!rule) return

  const { ruleID, RHSs } = rule
  const ruleIdL = ruleID.toLowerCase()
  const ret = RHSs.map(r => `${idx === 0 ? '\t' : ''}${ruleIdL}${r.toLowerCase()}${idx === 0 ? `=${enumS}` : ''}`)

  return [...ret, ruleIdL, '']
}

const parseRuleIDs = (rules, enumS) => {
  const keys = Object.keys(rules)
  const res = keys.map((k, idx) => ParseRuleID(rules[k], enumS, idx))
  const cnt = res.reduce((a, b) => a + b.length, 0) - res.length
  const ret = res.map(r => r.join(', ')).join('\n\t')
  return [cnt, ret]
}

export const createParseRule = (rules, fname='rule', num=1) => {

  const fno = fname.split('rule')[1]
  // const parseRuleID = rules.map(r => createParseRule_ID(r))

  const enumS = (fno-1)*300

  const [cnt, enums] = parseRuleIDs(rules, enumS)

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
    `${enums}`,
    `};`,
    ``,
    `#define MaxRuleNum${num} ${cnt}`,
    ``,
    `#endif`,
    ``
  ].join('\n')

  console.log(ret)
}