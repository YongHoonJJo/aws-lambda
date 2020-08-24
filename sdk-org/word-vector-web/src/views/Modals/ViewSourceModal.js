import React, { useState } from "react"
import styled from 'styled-components'

import Input from "../../components/common/Input";
import Radio from '../../styles/Radio'

import { createParseRule } from '../ruleCompiler/rnameN-h'
import { createRuleN_CPP } from '../ruleCompiler/ruleN-cpp'
import { createApplyN_CPP } from '../ruleCompiler/applyN-cpp'
import { createRuleN_Proto_h } from '../ruleCompiler/ruleN-proto-h'
import { create_rnameN_cpp } from '../ruleCompiler/rnameN-cpp'

const ViewSourceModal = ({modalFlag, closeModal, targetRule={}, rulesF={}}) => {

  const [content, setContent] = useState('')
  const [radio, setRadio] = useState({
    options: [
      { value: 'applyN.cpp', label: 'applyN.cpp' },
      { value: 'rnameN.cpp', label: 'rnameN.cpp' },
      { value: 'rnameN.h', label: 'rnameN.h' },
      { value: 'ruleN.cpp', label: 'ruleN.cpp' },
      { value: 'ruleN-proto.h', label: 'ruleN-proto.h' },
    ],
    name: 'Select File',
    currentValue: ''
  })

  const { filename='' } = targetRule
  const { name, currentValue, options } = radio

  const onChangeRadio = (selected) => {
    setRadio({...radio, currentValue: selected})
    switch(selected) {
      case 'applyN.cpp': setContent(createApplyN_CPP(rulesF[filename], filename)); return
      case 'rnameN.cpp': setContent(create_rnameN_cpp(rulesF[filename], filename)); return
      case 'rnameN.h': setContent(createParseRule(rulesF[filename], filename)); return
      case 'ruleN.cpp': setContent(createRuleN_CPP(rulesF[filename], filename)); return
      case 'ruleN-proto.h': setContent(createRuleN_Proto_h(rulesF[filename], filename)); return
      default: setContent('')
    }
  }

  const onDownload = () => {
    if(radio.currentValue === '') return

    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);

    const [_, num] = filename.split('rule')
    const [b, e] = radio.currentValue.split('N')

    element.download = [b, num, e].join('');
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  return (
    <Wrap modalFlag={modalFlag}>
      <Modal>
        <Xbtn onClick={closeModal} src={'https://d319d1tzjwpwbb.cloudfront.net/app/images/2020-04-23/208d27637366c16a60deac167ec3b3c4.svg'} />
        <Title>View Source</Title>
        <SectionBox>
          <InputSection>
            <Input label={'File Name'} readOnly value={filename} onChange={() => {}} />
            <Radio
              label={name} currentValue={currentValue} name={name}
              options={options}
              onChange={onChangeRadio}
              title={false}
            />
            <ContentBox>
              {content}
            </ContentBox>
          </InputSection>
        </SectionBox>
        <Button onClick={onDownload}>Download</Button>
      </Modal>
    </Wrap>
  )
}

export default ViewSourceModal

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

const ContentBox = styled.pre`
  width: 800px;
  height: 500px;
  border: 1px solid #000000; 
  padding: 20px;
  text-align: left;
  overflow-y: scroll;
  
  white-space: pre/pre-line/pre-wrap
`