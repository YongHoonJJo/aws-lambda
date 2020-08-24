import React from 'react'
import styled from 'styled-components'

const Input = ({label, type='text', onChange, value, placeholder='', readOnly=false, w, h}) => {
  return (
    <Wrap>
      <Label>{label}</Label>
      <InputStyle w={w} h={h} readOnly={readOnly} type={type} onChange={onChange} value={value} placeholder={placeholder} />
    </Wrap>
  )
}

export default Input

const Wrap = styled.div`
  margin: 20px 0;
  display: flex;
  // justify-content: center;
  align-items: center;
`

const Label = styled.label`
  display: block;
  font-size: 1.2rem;
  margin-right: 20px;
  width: 100px;
`

const InputStyle = styled.input`
  width: ${({w}) => w ? `${w}px` : '650px'};
  height: ${({h}) => h ? h : '40'}px;
  outline: none;
  padding-left: 10px; 
  font-size: 1.2rem;
  border: 1px solid #d7d7d7;
`