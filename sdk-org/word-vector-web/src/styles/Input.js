import React from 'react'
import styled from 'styled-components'

const Input = ({label, type='text', name, value, onChange}) => {
  return (
    <Wrap>
      <Label>{label}</Label>
      <InputStyle type={type} name={name} value={value} onChange={onChange}/>
    </Wrap>
  )
}

export default Input

const Wrap = styled.div`
  margin: 20px 0;
`

const Label = styled.label`
  font-size: 12px;
  padding-right: 10px;
`

const InputStyle = styled.input`
  padding-left: 5px;
`