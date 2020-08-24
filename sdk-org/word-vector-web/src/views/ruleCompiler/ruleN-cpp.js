


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

/* Parse RHSs Conditions */

const getGetIndicCode = (rhs, param, val) => `${rhs}->getIndic( ${param} ) == ${val == '0' ? 'false' : 'true'}`

const getPattern = (rhs, val) => `${rhs}->getPattern( ${val} ) == 1`

const getCheckDictString = (rhs, val) => `${rhs}->checkDictString( ${val} ) == true`

const getDets = (rhs, val) => `${rhs}->getIndic( DEF ) == ${val == '0' ? 'false' : 'true'} && ${rhs}->getIndic( INDEF ) == ${val == '0' ? 'false' : 'true'}`

const getEtc = (rhs, str) => {
  const [param, val] = str.trim().split('=')
  if(param === 'pattern') return getPattern(rhs, val)
  if(param === 'dict') return getCheckDictString(rhs, val)
  if(param === 'DETS') return getDets(rhs, val)
  return getGetIndicCode(rhs, param, val)
}

const getCheckChildTreeCode = (rhs, str) => {
  const [param, val] = str.trim().split('->')
  return `${rhs}->checkChildTree( ${param} ) == ${val == '0' ? 'false' : 'true'}`
}

const getFunc = p => {
  switch(p) {
    case 'pos': return 'getPos()'
    case 'func': return 'getFunc()'
    case 'epred': return 'getEPred()'
    default: return p
  }
}

const getFuncNotEq = (rhs, str) => {
  const [param, val] = str.trim().split(`!='`)
  return `${rhs}->${getFunc(param)} != ${val}`
}

const getFuncEq = (rhs, str) => {
  const [param, val] = str.trim().split(`='`)
  return `${rhs}->${getFunc(param)} == ${val}`
}

let checkStr = ''

const getCheckStr = s => {
  checkStr = s
  switch(s) {
    case 'epred': return 'checkEPredString'
    case 'pred': return 'checkPredString'
    case 'fword': return 'checkFwordString'
    case 'dict': return 'checkDictString'
    default: return s
  }
}

const getCheckStrF = (rhs, str) => {
  const [param, val] = str.trim().split(`!=`)
  return `${rhs}->${getCheckStr(param)}( ${val} ) == false`
}

const getCheckStrT = (rhs, str) => {
  const [param, val] = str.trim().split(`=`)
  return `${rhs}->${getCheckStr(param)}( ${val} ) == true`
}

const checkPredStrOr = (rhs, str) => `${rhs}->${getCheckStr(checkStr)}( ${str} ) == true`

const parseRhsCds = (rhs, condi) => {
  const condis = condi.split(', ')
  const result = condis.map(c =>{
    const res = c.split(' or ').map(s => {
      if(s.indexOf('->') != -1) return getCheckChildTreeCode(rhs, s)
      if(s.indexOf(`!='`) != -1) return getFuncNotEq(rhs, s)
      if(s.indexOf(`='`) != -1) return getFuncEq(rhs, s)
      if(s.indexOf(`!="`) != -1) return getCheckStrF(rhs, s)
      if(s.indexOf(`="`) != -1) return getCheckStrT(rhs, s)
      if(s[0] === `"` && s[s.length-1] === `"`) return checkPredStrOr(rhs, s)
      return getEtc(rhs, s)
    })
    const ret = res.join(' || \n\t\t\t')
    return res.length > 1 ? `( ${ret} )` : ret
  })
  // console.log(result.join(' && \n'))
  return result.join(' && \n\t\t')
}

const createRhsRule = (ruleID, num, rhs, condi) => {
  if(condi === '') return
  // console.log({rhs, condi})
  const rhsL = rhs.toLowerCase()
  const ret = [
    `Treenode${num}_ROOI* _PARSE_RULE::${ruleID}${rhsL}(Treenode${num}_ROOI* ${rhsL})`,
    `{`,
    `\tif ( ${parseRhsCds(rhsL, condi)} )`,
    `\t\treturn ${rhsL};`,
    `\telse return NULL;`,
    `}`,
    ``
  ]
  // console.log(ret.join('\n'))
  return ret.join('\n')
}

/* Parse LSH Action */

const getSomeTest = (action, RHSs) => {
  const [title, con1, con2] = action.split(' ')
  if(con1) {
    const p1 = con1.split('.').map(p => RHSs.includes(p) ? p.toLowerCase() : p)
    const p2 = con2.split('.').map(p => RHSs.includes(p) ? p.toLowerCase() : p)
    const params = [...p1, ...p2].filter(p => p).join(', ')
    return  [
      `if (!m_pMT->aParse.${title}( ${params} ) )`,
      `return NULL;`
    ].join('\n\t\t')
  } else {
    const p = title === 'QuesSentTest' ? '' : 'x'
    return  [
      `if (!m_pMT->aParse.${title}(${p}) )`,
      `return NULL;`
    ].join('\n\t\t')
  }

}

const getCopyTree = action => {
  const [_, rhs] = action.split('%')
  const rhsL = rhs.toLowerCase()
  return [
    `x = ${rhsL}->copyTree();`,
    `pScore = ${rhsL}->getScore();`,
    `x->setScore(1.0);`,
  ].join('\n\t')
}

const getTmpCopyTree = (a, num) => {
  const [tmp, rhs] = a.split('=%')
  const rhsL = rhs.toLowerCase()
  return [
    `Treenode${num}_ROOI *tmp;`,
    ``,
    `${tmp} = ${rhsL}->copyTree();`,
    `pScore = ${rhsL}->getScore();`,
    `${tmp}->setScore(1.0);`,
  ].join('\n\t')
}

const getInit = num => `x = new Treenode${num}_ROOI();`

const switchSetFunc = f => {
  switch(f) {
    case 'cat': return 'setCategory'
    case 'pos': return 'setPos'
    case 'func': return 'setFunc'
    default: return f
  }
}

const getSetFunc = a => {
  const [f, p] = a.split(`='`)
  if(f.indexOf('.') != -1) {
    const [x, f2] = f.split('.')
    return `${x}->${switchSetFunc(f2)}( ${p} );`
  }
  return `x->${switchSetFunc(f)}( ${p} );`
}

const getSetFunc2 = a => {
  const [f, p] = a.split(`=`)
  return `x->${switchSetFunc(f)}( ${p.toLowerCase()}->getFunc() );`
}

const getAParse = (a, RHSs) => {
  const [f, ...ps] = a.trim().split(' ')

  const params = ['x', ...ps.map(p => RHSs.includes(p) ? p.toLowerCase() : p)].join(', ')
  return `m_pMT->aParse.${f}( ${params} );`
}

const getSetAttribute = a => {
  const [p1, p2, p3] = a.split('->')
  // console.log({p1, p2, p3})
  if(p3) {
    return `x->setAttribute( ${p1}, ${p2.toLowerCase()}->getChildTree( ${p3} ) );`
  }
  if(p2.indexOf('=') != -1) {
    const [k, v] = p2.split('=')
    return `${p1.toLowerCase()}->setIndic( ${k}, ${v} );`
  }
  if(p1.indexOf('.') != -1) {
    const [k, v] = p1.split('.')
    return `${k.toLowerCase()}->setAttribute( ${v}, ${p2.toLowerCase()} );`
  }
  return `x->setAttribute( ${p1}, ${p2.toLowerCase()} );`
}

const getSomething = k => {
  switch(k) {
    case 'pred': return 'getPred'
    default: return k
  }
}

const getSetFword = a => {
  const [title, str] = a.split('=')
  const x = title.indexOf('.') != -1 ? title.split('.')[0].toLowerCase() : 'x'
  if(str.indexOf('.') != -1) {
    const [rhs, val] = str.split('.')
    const param = `${rhs.toLowerCase()}->${getSomething(val)}()->getString()`
    return `${x}->setFword( m_pMT->aParse.InitFword( ${param} ) );`
  }
  if(str[0] === `"` && str[str.length-1] === `"`) {
    return `${x}->setFword( m_pMT->aParse.InitFword( ${str} ) );`
  }
  return `${x}->setFword( m_pMT->aParse.InitFword( ${str.toLowerCase()}->getFword()->getWord() ) );`
}

const getSetPred = a => {
  const [tmp, str] = a.split('=')
  if(tmp.indexOf('.') != -1) {
    const [x] = tmp.split('.')
    return `${x}->setPred( m_pMT->aParse.InitPred( ${str} ) );`
  }
  return `x->setPred( m_pMT->aParse.InitPred( ${str} ) );`
}

const getSetEpred = a => {
  const [tmp, str] = a.split('=')
  if(tmp.indexOf('.') != -1) {
    const [x] = tmp.split('.')
    return `${x}->setEpred( ${str} );`
  }
  return `x->setEpred( ${str} );`
}

const getSetComplz = a => {
  const [title, v] = a.split('=')
  const x = title.indexOf('.') != -1 ? title.split('.')[0].toLowerCase() : 'x'
  return `${x}->setComplz( ${v} );`
}

const getSetAuxVerb = (a, jParam) => {
  const [title, v] = a.split('=')
  const x = title.indexOf('.') != -1 ? title.split('.')[0].toLowerCase() : (jParam ? 't->getTree()' : 'x')
  const fIndent = jParam ? '\t\t\t' : ''

  const [p, s] = v.split('.')
  return `${fIndent}${x}->setAuxVerb( ${p.toLowerCase()}->${getFunc(s)} );`
}

const getsetPattern = a => {
  const [title, v] = a.split('=')
  return `x->setPattern( ${v.toLowerCase()}->getPattern() );`
}

// const getSetFunc = a => {
//   const [title, v] = a.split(`='`)
//   return `x->setFunc( ${v} );`
// }

const getTENSEeqVERB = (a, jParam) => {
  const x = jParam ? 't->getTree()' : 'x'
  const sep = jParam || '\n\t'
  const fIndent = jParam ? '\t\t\t' : ''

  const [k, v] = a.split('=')
  if(v.indexOf('and') != -1) {
    const and = v.split('and')
    return [
      `${fIndent}${x}->setIndic( PRES, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( PRES )`).join(' && ')} );`,
      `${x}->setIndic( PAST, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( PAST )`).join(' && ')} );`,
      `${x}->setIndic( FUTURE, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( FUTURE )`).join(' && ')} );`,
    ].join(sep)
  }

  return [
    `${fIndent}${x}->setIndic( PRES, ${v.toLowerCase()}->getIndic( PRES ) );`,
    `${x}->setIndic( PAST, ${v.toLowerCase()}->getIndic( PAST ) );`,
    `${x}->setIndic( FUTURE, ${v.toLowerCase()}->getIndic( FUTURE ) );`,
  ].join(sep)
}

const getTYPESeq = (a, jParam) => {
  const x = jParam ? 't->getTree()' : 'x'
  const sep = jParam || '\n\t'
  const fIndent = jParam ? '\t\t\t' : ''

  const [k, v] = a.split('=')
  if(v.indexOf('and') != -1) {
    const and = v.split('and')
    return [
      `${fIndent}${x}->setIndic( MODAL, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( MODAL )`).join(' && ')} );`,
      `${x}->setIndic( BEVERB, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( BEVERB )`).join(' && ')} );`,
      `${x}->setIndic( NEED, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( NEED )`).join(' && ')} );`,
      `${x}->setIndic( HAVE, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( HAVE )`).join(' && ')} );`,
      `${x}->setIndic( DOVERB, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( DOVERB )`).join(' && ')} );`,
    ].join(sep)
  }

  return [
    `${fIndent}${x}->setIndic( MODAL, ${v.toLowerCase()}->getIndic( MODAL ) );`,
    `${x}->setIndic( BEVERB, ${v.toLowerCase()}->getIndic( BEVERB ) );`,
    `${x}->setIndic( NEED, ${v.toLowerCase()}->getIndic( NEED ) );`,
    `${x}->setIndic( HAVE, ${v.toLowerCase()}->getIndic( HAVE ) );`,
    `${x}->setIndic( DOVERB, ${v.toLowerCase()}->getIndic( DOVERB ) );`,
  ].join(sep)
}

const getVOICESSeq = (a, jParam) => {
  const x = jParam ? 't->getTree()' : 'x'
  const sep = jParam || '\n\t'
  const fIndent = jParam ? '\t\t\t' : ''

  const [k, v] = a.split('=')
  if(v.indexOf('and') != -1) {
    const and = v.split('and')
    return [
      `${fIndent}${x}->setIndic( ACTIVE, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( ACTIVE )`).join(' && ')} );`,
      `${x}->setIndic( PASSIV, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( PASSIV )`).join(' && ')} );`,
      `${x}->setIndic( PROGRESS, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( PROGRESS )`).join(' && ')} );`,
      `${x}->setIndic( PERFECT, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( PERFECT )`).join(' && ')} );`,
    ].join(sep)
  }

  return [
    `${fIndent}${x}->setIndic( ACTIVE, ${v.toLowerCase()}->getIndic( ACTIVE ) );`,
    `${x}->setIndic( PASSIV, ${v.toLowerCase()}->getIndic( PASSIV ) );`,
    `${x}->setIndic( PROGRESS, ${v.toLowerCase()}->getIndic( PROGRESS ) );`,
    `${x}->setIndic( PERFECT, ${v.toLowerCase()}->getIndic( PERFECT ) );`,
  ].join(sep)
}

const getFORMSeqVERB = (a, jParam) => {
  const x = jParam ? 't->getTree()' : 'x'
  const sep = jParam || '\n\t'
  const fIndent = jParam ? '\t\t\t' : ''

  const [k, v] = a.split('=')

  if(v.indexOf('and') != -1) {
    const and = v.split('and')
    return [
      `${fIndent}${x}->setIndic( PRESPFORM, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( PRESPFORM )`).join(' && ')} );`,
      `${x}->setIndic( SGPRES3, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( SGPRES3 )`).join(' && ')} );`,
      `${x}->setIndic( INFFORM, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( INFFORM )`).join(' && ')} );`,
      `${x}->setIndic( PASTFORM, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( INFFORM )`).join(' && ')} );`,
      `${x}->setIndic( PASTPFORM, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( PASTFORM )`).join(' && ')} );`,
      `${x}->setIndic( PRESPFORM, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( PASTPFORM )`).join(' && ')} );`,
      `${x}->setIndic( SIMPLE, ${and.map(r => `${r.trim().toLowerCase()}->getIndic( SIMPLE )`).join(' && ')} );`,
    ].join(sep)
  }

  return [
    `${fIndent}${x}->setIndic( PRESPFORM, ${v.toLowerCase()}->getIndic( PRESPFORM ) );`,
    `${x}->setIndic( SGPRES3, ${v.toLowerCase()}->getIndic( SGPRES3 ) );`,
    `${x}->setIndic( INFFORM, ${v.toLowerCase()}->getIndic( INFFORM ) );`,
    `${x}->setIndic( PASTFORM, ${v.toLowerCase()}->getIndic( PASTFORM ) );`,
    `${x}->setIndic( PASTPFORM, ${v.toLowerCase()}->getIndic( PASTPFORM ) );`,
    `${x}->setIndic( PRESPFORM, ${v.toLowerCase()}->getIndic( PRESPFORM ) );`,
    `${x}->setIndic( SIMPLE, ${v.toLowerCase()}->getIndic( SIMPLE ) );`,
  ].join(sep)
}

const getSetIndic = (a, jParam) => {

  if(a.indexOf('auxverb=') != -1) return getSetAuxVerb(a, jParam)

  const [k, v] = a.split('=')
  if(!v) return a

  const x = jParam ? 't->getTree()' : 'x'
  const fIndent = jParam ? '\t\t\t' : ''

  if(v.length === 1) {
    if(k.indexOf('.') != -1) {
      const [xx, kk] = k.split('.')
      return `${fIndent}${xx.toLowerCase()}->setIndic( ${kk}, ${v} );`
    }
    return `${fIndent}${x}->setIndic( ${k}, ${v} );`
  }

  if(v.indexOf('or') != -1) {
    const val = v.split(' or ').map(or => {
      if(or.indexOf('.') != -1) {
        const [s, p] = or.split('.')
        return `${s.toLowerCase()}->getIndic( ${p} )`
      }
      return `${or.toLowerCase()}->getIndic( ${k} )`
    }).join(' || ')
    return `${fIndent}${x}->setIndic( ${k}, ${val} );`
  }

  if(v.indexOf('and') != -1) {
    const val = v.split(' and ').map(or => {
      if(or.indexOf('.') != -1) {
        const [s, p] = or.split('.')
        return `${s.toLowerCase()}->getIndic( ${p} )`
      }
      return `${or.toLowerCase()}->getIndic( ${k} )`
    }).join(' && ')
    return `${fIndent}${x}->setIndic( ${k}, ${val} );`
  }

  if(v.length > 1) {
    if(v.indexOf('.') != -1) {
      const [s, p] = v.split('.')
      return `${fIndent}${x}->setIndic( ${k}, ${s.toLowerCase()}->getIndic( ${p} ) );`
    }
    if(k === 'DETS') {
      return [
        `${fIndent}${x}->setIndic( DEF, ${v.toLowerCase()}->getIndic( DEF )  );`,
        `${fIndent}${x}->setIndic( INDEF, ${v.toLowerCase()}->getIndic( INDEF )  );`
      ].join('\n\t')
    }
    return `${fIndent}${x}->setIndic( ${k}, ${v.toLowerCase()}->getIndic( ${k} )  );`
  }

  return a
}

const getChildForBody = a => {
  switch(a) {
    case 'TENSES=VERB': return getTENSEeqVERB(a, '\n\t\t\t\t')
    case 'FORMS=VERB': return getFORMSeqVERB(a,'\n\t\t\t\t')
    default: return getSetIndic(a, '\t\t\t\t')
  }
}

const getChildDot = a => {
  const [_, act] = a.split('child.')

  const body = getChildForBody(act)

  const ret = [
    `{`,
    `\tTreenodeList1_ROOI *t;`,
    `\tfor (t = x->getAttrs(); t; t = t->getNext())`,
    `\t{`,
    `\t\tif (t->getTree()->getFunc() == CMODS)`,
    `\t\t{`,
    `${body}`,
    `\t\t}`,
    `\t}`,
    `}`,
  ].join('\n\t')

  return ret
}


const getScore = a => {
  const [_, s] = a.split('=')
  return [
    `x->calcRuleScore( ${s} );`,
    `x->calcScore( pScore );`
  ].join('\n\t')
}

const getCalcScore = rhs => `x->calcScore(${rhs}->getScore());`

const parseLhsAction = (lhsAction, RHSs, num) => {
  // const la = lhsAction.split(', ')
  // console.log({la})
  let rhs = ''
  const ret = lhsAction.split(',').map(k => {
    const a = k.trim()
    if(a.indexOf('CommonTest') != -1) return getSomeTest(a, RHSs)
    if(a.indexOf('SamePredTest') != -1) return getSomeTest(a, RHSs)
    if(a.indexOf('DisjointTest') != -1) return getSomeTest(a, RHSs)
    if(a.indexOf('CaseTest') != -1) return getSomeTest(a, RHSs)
    if(a.indexOf('AgreeTest') != -1) return getSomeTest(a, RHSs)
    if(a.indexOf('PastpTest') != -1) return getSomeTest(a, RHSs)
    if(a.indexOf('RlclTest2') != -1) return getSomeTest(a, RHSs)
    if(a.indexOf('QuesSentTest') != -1) return getSomeTest(a, RHSs)

    if(a[0] === '%') {
      rhs = a.split('%')[1]
      return getCopyTree(a)
    }
    if(a.indexOf('=%') != -1) {
      rhs = a.split('%')[1]
      return getTmpCopyTree(a, num)
    }
    if(a.indexOf('Init') != -1) return getInit(num)

    if(a.indexOf('child.') != -1) return getChildDot(a)
    if(a.indexOf('TENSES=') != -1) return getTENSEeqVERB(a)
    if(a.indexOf('FORMS=') != -1) return getFORMSeqVERB(a)
    if(a.indexOf('TYPES=') != -1) return getTYPESeq(a)
    if(a.indexOf('VOICES=') != -1) return getVOICESSeq(a)

    if(a.indexOf('SetCommonCase') != -1) return getAParse(a, RHSs)
    if(a.indexOf('CalcConjScore') != -1) return getAParse(a, RHSs)
    if(a.indexOf('RefArgToScore') != -1) return getAParse(a, RHSs)
    if(a.indexOf('RefIndicToScore') != -1) return getAParse(a, RHSs)
    if(a.indexOf('CalcPrepScore') != -1) return getAParse(a, RHSs)
    if(a.indexOf('CalcSentScore') != -1) return getAParse(a, RHSs)
    if(a.indexOf('CalcVpScore') != -1) return getAParse(a, RHSs)
    if(a.indexOf('CalcSubjScore') != -1) return getAParse(a, RHSs)

    if(a.indexOf('epred=') != -1) return getSetEpred(a)
    if(a.indexOf('pred=') != -1) return getSetPred(a)
    if(a.indexOf('fword=') != -1) return getSetFword(a)
    if(a.indexOf('complz') != -1) return getSetComplz(a)
    if(a.indexOf('auxverb=') != -1) return getSetAuxVerb(a)
    if(a.indexOf('pattern=') != -1) return getsetPattern(a)
    if(a.indexOf(`='`) != -1) return getSetFunc(a)
    if(a.indexOf(`func=`) != -1) return getSetFunc2(a)

    if(a.indexOf('->') != -1) return getSetAttribute(a)
    if(a.indexOf('score') != -1) return getScore(a)
    return getSetIndic(a)
  })

  const calcScores = RHSs.filter(r => r != rhs).map(r => getCalcScore(r.toLowerCase()))
  // console.log(ret.concat(calcScores).join('\n\t'))
  return ret.concat(calcScores).join('\n\t')
}

const createLhsRule = (ruleID, RHSs, lhsAction, num) => {
  if(lhsAction === '') return

  const params = RHSs.map(r => `Treenode${num}_ROOI* ${r.toLowerCase()}`).join(', ')

  const ret = [
    `Treenode${num}_ROOI* _PARSE_RULE::${ruleID}( ${params} )`,
    `{`,
    `\tTreenode${num}_ROOI* x;`,
    `\tdouble pScore;`,
    '',
    `\t${parseLhsAction(lhsAction, RHSs, num)}`,
    `\treturn x;`,
    `}`
  ]
  // console.log(ret.join('\n'))
  return ret.join('\n')
}

export const createRule = (rule, num=1) => {
  if(!rule) return

  const { ruleID, contents, LHS, RHSs, rhsConditions, lhsAction } = rule
  const retR = RHSs.map(r => createRhsRule(ruleID, num, r, rhsConditions[r]))
  const retL = createLhsRule(ruleID, RHSs, lhsAction, num)
  return ['', ...retR, retL].join('\n')
}

export const createRuleN_CPP = (rules, fname) => {
  const keys = Object.keys(rules)
  const res = keys.map(k => createRule(rules[k]))
  const ret = [
    `#include "ekmt-header.h"`, ,
    ...res
  ].join('\n')
  // console.log(ret)
  return ret
}
