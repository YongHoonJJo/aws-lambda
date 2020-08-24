import React from 'react'
import styled from 'styled-components'

const Textarea = ({label, type='text', onChange, value, placeholder='', readOnly=false, row=40, col=60 }) => {
  return (
    <Wrap>
      <Label>{label}</Label>
      <TextareaStyle
        readOnly={readOnly} type={type} onChange={onChange} value={value} placeholder={placeholder}
      />
    </Wrap>
  )
}

export default Textarea

const Wrap = styled.div`
  margin: 20px 0;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Label = styled.label`
  display: block;
  font-size: 1.2rem;
  margin-right: 20px;
  width: 100px;
`

const TextareaStyle = styled.textarea`
  outline: none;
  padding-left: 10px; 
  font-size: 1.2rem;
  border: 1px solid #d7d7d7;
  
  width: 650px;
  height: 150px;
`