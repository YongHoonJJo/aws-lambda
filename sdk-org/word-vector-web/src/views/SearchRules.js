import React, { useState, useEffect, Fragment } from 'react'
import styled from "styled-components";
import axios from 'axios'

import Radio from '../styles/Radio'

import { ruleCompilerURL } from '../apis/api'
import RuleUpdateModal from "./Modals/RuleUpdateModal";
import ViewSourceModal from './Modals/ViewSourceModal'

const SearchRules = () => {
  const [rules, setRules] = useState({})
  const [loading, setLoading] = useState(true)
  const [ruleID, setRuleID] = useState('')
  const [RHSsLHS, setRHSsLHS] = useState({ LHS: '', RHSs: [], rhs: '' })
  const [result, setResult] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [radio, setRadio] = useState({
    options: [
      { value: 'RuleID', label: 'RuleID' }, 
      { value: 'RHSs|LHS', label: 'RHSs | LHS' }
    ],
    name: 'Search Rule',
    currentValue: 'RuleID'
  })

  const [rulesF, setRulesF] = useState({})
  const [updateRuleInfo, setUpdateRuleInfo] = useState({
    updateModalFlag: false,
  })
  const [viewSrcInfo, setViewSrcInfo] = useState({
    viewSrcModalFlag: false,
  })

  const closeViewSrcModal = rule => {
    setViewSrcInfo({
      viewSrcModalFlag: false,
    })
  }

  const openViewSrcModal = rule => {
    if(!rule) return

    setViewSrcInfo({
      viewSrcModalFlag: true,
      ...rule
    })
  }

  const openUpdateRuleModal = rule => {
    if(!rule) return

    setUpdateRuleInfo({
      updateModalFlag: true,
      ...rule
    })
  }

  const closeUpdateRuleModal = rule => {
    setUpdateRuleInfo({
      updateModalFlag: false,
    })
  }

  const checkCondition = c => {
    if(c[c.length-1] !== ')') return false
    return true
  }

  const onUpdateRuleReq = () => {
    const { ruleID='', contents='' } = updateRuleInfo

    const data = contents.split(' -> ')
    if(data.length != 2) {
      window.alert('RULE 형식이 잘못되었습니다.')
      return ;
    }

    const [lhs, rhss] = data
    if(!checkCondition(lhs) || !checkCondition(rhss)) {
      window.alert('RULE 형식이 잘못되었습니다..')
      return ;
    }

    console.log({ruleID, contents})
    // TODO call update api
  }

  const { RHSs, rhs, LHS } = RHSsLHS
  const { currentValue } = radio

  const onChangeRadio = (selected) => {
    setRadio({...radio, currentValue: selected}) 
  }

  const onChangeRHSs = (e, idx) => {
    const newRHSs = [...RHSs]
    newRHSs[idx] = e.target.value
    setRHSsLHS({...RHSsLHS, RHSs: newRHSs})
  }

  const onAddRhs = () => {
    const newRHSs = [...RHSs, rhs]
    setRHSsLHS({...RHSsLHS, RHSs: newRHSs, rhs: ''})
  }

  const onRemoveRhs = () => {
    if(RHSs.length === 0) return ;
    const newRHSs = [...RHSs]
    const [lastRHS] = newRHSs.splice(-1)
    setRHSsLHS({...RHSsLHS, RHSs: newRHSs, rhs: lastRHS})
  }

  const includesRHSs = (RHSs, inRHSs) => {
    for(let i=0; i<inRHSs.length; i++)
      if(RHSs[i] !== inRHSs[i])
        return false
    return true
  }

  const onSearch = () => {
    if(currentValue === 'RuleID') {
      const rule = rules[ruleID]
      // rule && setResult([`${ruleID} : ${rule.RHSs.join(' ')} -> ${rule.LHS}`])
      rule && setResult([ruleID])
    } else {
      const lhs = LHS.trim()
      const inputRHSs = rhs.trim() === '' ? [...RHSs] : [...RHSs, rhs.trim()]

      if(lhs === '' && inputRHSs.length === 0) return 

      const fRules = lhs === '' ? Object.values(rules) : Object.values(rules).filter(rv => rv.LHS === lhs)
      const res = inputRHSs.length === 0 ? fRules : fRules.filter(r => includesRHSs(r.RHSs, inputRHSs))
      // setResult(res.map(r => `${r.ruleID} : ${r.RHSs.join(' ')} -> ${r.LHS}`))
      setResult(res.map(r => r.ruleID))
    }
  }

  const onClear = () => {
    setRuleID('')
    setRHSsLHS({ LHS: '', RHSs: [], rhs: '' })
    setResult([])
    setSelected(new Set())
  }

  const onSelectRules = (rID) => {
    if(selected.has(rID)) { // unselect
      selected.delete(rID)
      setSelected(new Set(selected.keys()))
      return 
    }
    if(selected.size < 2) {
      selected.add(rID)
      setSelected(new Set(selected.keys()))
      return
    }
  }

  const fetchData = async () => {
    const files = [
      'N-rule1', 'N-rule2', 'N-rule3', 'N-rule4', 'N-rule5',
      'N-rule6', 'N-rule7', 'N-rule8', 'N-rule9', 'N-rule10',
    ]
    try {
      const results = await Promise.all(files.map(f => axios.get(`${ruleCompilerURL}/getRules/${f}`)))
      const data = results.map(({data}) => data).reduce((a, b) => ({...a, ...b}))
      setLoading(false)
      setRules(data)
      // console.log({data})

      const dataByF = results
        .map(({data}, idx) => ({[files[idx]]: data}))
        .reduce((a, b) => ({...a, ...b}), {})

      setRulesF(dataByF)
    } catch(e) {
      console.log({e})
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const it = selected.keys()
  const sel1 = it.next().value
  const sel2 = it.next().value

  if(loading) return <Wrap>{'Loading...'}</Wrap>

  return (
    <Wrap>
      <Radio label={radio.name} currentValue={radio.currentValue} name={radio.name} options={radio.options} onChange={onChangeRadio} />
      {radio.currentValue === 'RuleID' ? 
      <InputBox>
        <Label>Rule ID</Label>
        <InputStyle type='text' value={ruleID} onChange={e => setRuleID(e.target.value)} />
      </InputBox>
      :
      <>
        <InputBox>
          <Label>LHS</Label>
          <InputStyle type='text' value={LHS} onChange={e => setRHSsLHS({...RHSsLHS, LHS: e.target.value})} />
        </InputBox>
        <InputBox>
          <Label>RHSs</Label>
          {RHSs.map((r, idx) => <InputStyle key={idx} type='text' value={r} onChange={e => onChangeRHSs(e, idx)} />)}
          <InputStyle type='text' value={rhs} onChange={e => setRHSsLHS({...RHSsLHS, rhs: e.target.value})} />
          <Button onClick={onAddRhs}>+</Button><Button onClick={onRemoveRhs}>-</Button>
        </InputBox>
      </>}
      <ButtonBox>
        <Button onClick={onSearch}>Search</Button><Button onClick={onClear}>Clear</Button>
      </ButtonBox>

      <ResultWrap>
        <ResultBox>
          <ResultTitle>Retrived Rules ({result.length})</ResultTitle>
          <UlStyle>
            {result.map(rID =>
              <Fragment key={rID}>
                <RuleLi selected={selected.has(rID)} onClick={() => onSelectRules(rID)}><SpanLHS>{rID}</SpanLHS> : {`${rules[rID].LHS} -> ${rules[rID].RHSs.join(' ')}`}</RuleLi>
                <br/>
              </Fragment>)}
            </UlStyle>
        </ResultBox>
        <ResultBoxR>
            <TitleBox>
              <ResultTitle>Selected Rule 1</ResultTitle>
              <ButtonBox2>
                <Button2 onClick={() => openUpdateRuleModal(rules[sel1])}>Edit Rule</Button2>
                <Button2 onClick={() => openViewSrcModal(rules[sel1])}>View Source</Button2>
              </ButtonBox2>
            </TitleBox>
            <ContentBox>
              {sel1 ? <p>{`${sel1} : ${rules[sel1].contents}`}</p> : null}
            </ContentBox>
            <TitleBox>
              <ResultTitle>Selected Rule 2</ResultTitle>
              <ButtonBox2>
                <Button2 onClick={() => openUpdateRuleModal(rules[sel2])}>Edit Rule</Button2>
                <Button2 onClick={() => openViewSrcModal(rules[sel2])}>View Source</Button2>
              </ButtonBox2>
            </TitleBox>
            <ContentBox>
              {sel2 ? <p>{`${sel2} : ${rules[sel2].contents}`}</p> : null}
            </ContentBox>
        </ResultBoxR>
      </ResultWrap>
      <RuleUpdateModal
        modalFlag={updateRuleInfo.updateModalFlag}
        closeModal={closeUpdateRuleModal}
        targetRule={updateRuleInfo}
        setUpdateRuleInfo={setUpdateRuleInfo}
        onUpdateRuleReq={onUpdateRuleReq}
      />
      <ViewSourceModal
        modalFlag={viewSrcInfo.viewSrcModalFlag}
        closeModal={closeViewSrcModal}
        targetRule={viewSrcInfo}
        rulesF={rulesF}
      />
    </Wrap>
  )
}

export default SearchRules

const Wrap = styled.div`
  width: 100%;
  margin: 50px auto;
`

const InputBox = styled.div`
  margin-top: 10px;
`

const Label = styled.label`
  font-size: 12px;
  padding-right: 10px;
  font-weight: bold;

  display: inline-block;
  width: 50px;
`

const InputStyle = styled.input`
  padding-left: 5px;
  width: 70px;
  margin-right: 10px;
  outline: none;
`

const Button = styled.button`
  outline: none;
`

const Button2 = styled.button`
  outline: none;
  margin-right: 20px;
`

const ButtonBox = styled.div`
  margin-top: 10px;
`

const ResultBox = styled.div`
  margin-top: 20px;
  width: 320px;
`

const ResultBoxR = styled.div`
  margin-top: 20px;
  margin-left: 35px;
`

const ResultTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-top: 30px;
  margin-bottom: 10px;
`

const RuleLi = styled.li`
  display: inline-block;
  padding: 5px;
  margin-top: 5px;
  cursor: pointer;
  ${({selected}) => selected ? 'background: #4caa9f;' : ''}
`

const SpanLHS = styled.span`
  display: inline-block;
  width: 65px;
`

const ResultWrap = styled.div`
  display: flex;
`

const ContentBox = styled.div`
  width: 600px;
  height: 200px;
  border: 1px solid #000000; 
  padding: 10px;
`

const UlStyle = styled.ul`
  height: 460px;
  width: 320px;
  overflow-y: scroll;
  border: 1px solid #000000;
  padding: 10px;
`

const TitleBox = styled.div`
  display: flex;
`

const ButtonBox2 = styled.div`
  margin-top: 30px;
  margin-left: 30px;
`