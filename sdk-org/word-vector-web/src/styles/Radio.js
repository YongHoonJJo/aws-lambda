import React from 'react'
import styled from 'styled-components'

const Radio = ({label, name, currentValue, options, onChange}) => {
  return (
    <Wrap>
      <Label>{label}</Label>
      {options.map(({value, label}) => (
        <React.Fragment key={label}>
          <RadioStyle type="radio"
            name={name} id={label}
            checked={value === currentValue}
            onChange={() => onChange(value)}
          />
          <Label htmlFor={label}>{label}</Label>
        </React.Fragment>
      ))}
    </Wrap>
  )
}

export default Radio

const Wrap = styled.div`
  margin: 20px 0;
`

const Label = styled.label`
  font-size: 12px;
  padding-right: 10px;
`

const RadioStyle = styled.input`
  margin-right: 10px;
`

