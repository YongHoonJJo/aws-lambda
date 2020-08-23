

export const createRuleNameTableElem = (rule) => {
  if(!rule) return

  const { ruleID } = rule
  const ruleIdL = ruleID.toLowerCase()
  const ret = rule.RHSs.map(r => `${ruleIdL}-${r.toLowerCase()}`)
  ret.push(ruleIdL)

  console.log({ret})

  return ret
}

export const create_rnameN_cpp = (rules=[], fname='N-rule1') => {

  const num = fname.split('rule')[1]

  const ret = [
    `#include "ekmt-header.h"`,
    ``,
    `char* _PARSE_RULE::RuleNameTable${num}[ ] = {`,
    ``,
    `};`,
    ``
  ]

}