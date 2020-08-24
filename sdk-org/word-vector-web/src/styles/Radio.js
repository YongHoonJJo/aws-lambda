import React from 'react'
import styled from 'styled-components'

const Radio = ({label, name, currentValue, options, onChange, title=true}) => {
  return (
    <Wrap title={title.toString()}>
      <Label title={title.toString()}>{label}</Label>
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
  text-align: left;
  padding-left: ${({title}) => title === 'true' ? '0px;' : '10px;'}
`

const Label = styled.label`
  font-size: 18px;
  padding-right: 10px;
  font-weight: ${({title}) => title === 'true' ? 'bold' : 'unset'};
`

const RadioStyle = styled.input`
  margin-right: 10px;
`

