import React, { useState, useEffect } from 'react'
import styled from "styled-components";
import axios from 'axios'

import Radio from '../styles/Radio'

import { ruleCompilerURL } from '../apis/api'

const SearchRules = () => {
  const [rules, setRules] = useState({})
  const [loading, setLoading] = useState(true)
  const [ruleID, setRuleID] = useState('')
  const [RHSsLHS, setRHSsLHS] = useState({ LHS: '', RHSs: [], rhs: '' })
  const [result, setResult] = useState([])
  const [radio, setRadio] = useState({
    options: [
      { value: 'RuleID', label: 'RuleID' }, 
      { value: 'RHSs|LHS', label: 'RHSs | LHS' }
    ],
    name: 'Search Rule',
    currentValue: 'RuleID'
  })
  
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
  }

  useEffect(() => {
    const fetchData = async () => {
      const files = [
        'rule1', 'rule2', 'rule3', 'rule4', 'rule5', 
        'rule6', 'rule7', 'rule8', 'rule9', 'rule10',
      ]
      try {
        const results = await Promise.all(files.map(f => axios.get(`${ruleCompilerURL}/getRules/${f}`)))
        const data = results.map(({data}) => data).reduce((a, b) => ({...a, ...b}))
        setLoading(false)
        setRules(data)
        // console.log(data)
      } catch(e) {
        console.log({e})
      }
    }
    fetchData()
  }, [])
 
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
          <Label>RHSs</Label>
          {RHSs.map((r, idx) => <InputStyle key={idx} type='text' value={r} onChange={e => onChangeRHSs(e, idx)} />)}
          <InputStyle type='text' value={rhs} onChange={e => setRHSsLHS({...RHSsLHS, rhs: e.target.value})} />
          <Button onClick={onAddRhs}>+</Button><Button onClick={onRemoveRhs}>-</Button>
        </InputBox>
        <InputBox>
          <Label>LHS</Label>
          <InputStyle type='text' value={LHS} onChange={e => setRHSsLHS({...RHSsLHS, LHS: e.target.value})} />
        </InputBox>
      </>}
      <ButtonBox>
        <Button onClick={onSearch}>Search</Button><Button onClick={onClear}>Clear</Button>
      </ButtonBox>
      <ResultBox>
        {result.length > 0 ? 
        <>
          <ResultTitle>Retrived Rules ({result.length})</ResultTitle>
          <ul>
            {/* {result.map(r => <li key={r}>{r}</li>)} */}
        {result.map(rID => <li key={rID}><SpanLHS>{rID}</SpanLHS> : {`${rules[rID].RHSs.join(' ')} -> ${rules[rID].LHS}`}</li>)}
          </ul>
        </>: null}
      </ResultBox>
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

const ButtonBox = styled.div`
  margin-top: 10px;
`

const ResultBox = styled.div`
  margin-top: 20px;
`

const ResultTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-top: 30px;
  margin-bottom: 10px;
`

const SpanLHS = styled.span`
  display: inline-block;
  width: 65px;
`