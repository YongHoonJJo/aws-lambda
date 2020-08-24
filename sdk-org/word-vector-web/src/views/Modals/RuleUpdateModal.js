import React, { useState } from "react"
import styled from 'styled-components'

import Input from "../../components/common/Input";
import TextareaStyle from '../../components/common/Textarea'

const RuleUpdateModal = ({modalFlag, closeModal, targetRule={}, setUpdateRuleInfo, onUpdateRuleReq}) => {

  // console.log({targetRule})
  const { ruleID='', contents='' } = targetRule

  const onChangeHandler = (k, e) => {
    setUpdateRuleInfo({
      ...targetRule,
      [k]: e.currentTarget.value
    })
  }

  return (
    <Wrap modalFlag={modalFlag}>
      <Modal>
        <Xbtn onClick={closeModal} src={'https://d319d1tzjwpwbb.cloudfront.net/app/images/2020-04-23/208d27637366c16a60deac167ec3b3c4.svg'} />
        <Title>Edit Rule</Title>
        <SectionBox>
          <InputSection>
            <Input label={'Rule ID'} readOnly value={ruleID} onChange={e => onChangeHandler('ruleID', e)} />
            <TextareaStyle label={'Rule'} value={contents} onChange={e => onChangeHandler('contents', e)} />
          </InputSection>
        </SectionBox>
        <Button onClick={onUpdateRuleReq}>Update Rule</Button>
      </Modal>
    </Wrap>
  )
}

export default RuleUpdateModal

const Wrap = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: ${({modalFlag}) => modalFlag ? 'flex' : 'none'};
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: space-between;
  z-index: 99999;
  overflow: visible;
`

const Modal = styled.div`
  width: 850px;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.5);
  background-color: #ffffff;
  position: relative;
  margin: 0 auto;
  text-align: center;
`

const Xbtn = styled.img`
  width: 24px;
  height: 24px;
  position: absolute;
  top: 16px;
  right: 16px;
  cursor: pointer;
`

const Title = styled.h1`
  margin-top: 50px;
  margin-bottom: 30px;
  text-align: center;
  font-size: 1.5rem;
`

const Button = styled.div`
  width: 200px;
  height: 50px;
  margin: 25px auto;
  border: 1px solid #2CA2FC; 
  border-radius: .25em;
  display: flex;
  justify-content: center;
  align-items: center;
  // background: #2CA2FC;
  color: #fff;
  cursor: pointer;
  background: #4caa9f;
  font-size: 1.2rem;
`

const SectionBox = styled.div`
  display: flex;
  justify-content: center;
`

const InputSection = styled.div`
  margin: 0 20px;
`

const SectionTitle = styled.h2`
  font-size: 20px;
`