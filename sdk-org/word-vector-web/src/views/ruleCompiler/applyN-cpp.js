
const parseApply = (rules) => {
  const keys = Object.keys(rules)
  // console.log({keys})
  const ret = keys.map(k => {
    const ruleID = `${k.toLowerCase()}`
    const rhsCase = rules[k].RHSs.map(r => {
      const cs = `${ruleID}${r.toLowerCase()}`
      return [
        `\t\t\tcase ${cs} : if (pParam->getParameterCount() != 1)`,
        `\t\t\t\treturn NULL;`,
        `\t\t\telse return ${cs}( pParam->getParameter(0) );`,
        `\t\t\tbreak;`,
      ].join('\n\t\t\t')
    })

    const lhsParams = rules[k].RHSs
      .map((r, idx) => `pParam->getParameter(${idx})`)
      .join(', ')

    const lhsCase = [
      `\t\t\tcase ${ruleID} : if (pParam->getParameterCount() != ${rules[k].RHSs.length})`,
      `\t\t\t\treturn NULL;`,
      `\t\t\telse return ${ruleID}( ${lhsParams} );`,
      `\t\t\tbreak;`
    ].join('\n\t\t\t')

    return [...rhsCase, lhsCase].join('\n\n')
  })
  return ret.join('\n\n')
}

const createApply = (rules, fno=1, num=1) => {
  // console.log({rules})
  const ret = [
    `#include "ekmt-header.h"`,
    `#include "rname${fno}.h"`,
    ``,
    `Treenode${num}_ROOI* _PARSE_RULE::RuleApply${fno}(RuleInvokeParameter_ROOI *pParam)`,
    `{`,
    `\tswitch (pParam->getFunctionID())`,
    `\t{`,
    `${parseApply(rules)}`,
    `\t\tdefault : return NULL;`,
    `\t}`,
    `}`
  ]
  return ret.join('\n')
}

export const createApplyN_CPP = (rules, fname) => {
  const applyN = createApply(rules, 1)
  return applyN
}