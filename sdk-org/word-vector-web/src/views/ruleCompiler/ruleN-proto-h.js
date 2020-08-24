
const createRuleNProto = (rules, fno=1, num=1) => {
  const keys = Object.keys(rules)
  // console.log({keys})
  const ret = keys.map(k => {
    const ruleID = `${k.toLowerCase()}`
    const RHSs = rules[k].RHSs.map(r => {
      const rhsL = r.toLowerCase()
      return `Treenode${num}_ROOI* _PARSE_RULE::${ruleID}${rhsL}(Treenode${num}_ROOI* ${rhsL});`
    })

    const lhsParams = rules[k].RHSs.map(r => `Treenode${num}_ROOI* ${r.toLowerCase()}`).join(', ')
    const LHS = `Treenode${num}_ROOI* _PARSE_RULE::${ruleID}(${lhsParams});`

    return [...RHSs, LHS].join('\n')
  })
  return ret.join('\n')
}

export const createRuleN_Proto_h = (rules, fname) => {
  const ruleProto = createRuleNProto(rules, 1)
  // console.log(ruleProto)
  return ruleProto
}