

const createRuleNameTableElem = (rule) => {
  if(!rule) return

  const { ruleID, RHSs } = rule
  const ruleIdL = ruleID.toLowerCase()
  const ret = RHSs.map(r => `"${ruleIdL}-${r.toLowerCase()}"`)

  return [...ret, `"${ruleIdL}"`, ''].join(', ')
}

export const create_rnameN_cpp = (rules, fname='N-rule1') => {

  const fno = fname.split('rule')[1]

  const keys = Object.keys(rules)
  const elems = keys.map(k => createRuleNameTableElem(rules[k])).join('\n\t')

  const ret = [
    `#include "ekmt-header.h"`,
    ``,
    `char* _PARSE_RULE::RuleNameTable${fno}[ ] = {`,
    `\t${elems}`,
    `};`,
    ``
  ].join('\n')

  console.log(ret)
}