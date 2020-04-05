import React from 'react'
import styled from 'styled-components'

const Home = ({history}) => {
  
  return (
    <React.Fragment>
      <Iframe src='http://13.209.123.84:50000/' />
    </React.Fragment>
  )
}

export default Home

const Iframe = styled.iframe`
  width: 100%;
  height: 100%;
`