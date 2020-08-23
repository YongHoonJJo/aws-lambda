import React, { useEffect } from 'react'
import axios from 'axios'
import qs from 'querystring'
import styled from "styled-components";

const SelectCloud = () => {
  useEffect(() => {
    const id = '1692'
    const pw = 'qwer1234!@'
    const fetchData = async () => {
      try {
        // const { data } = await axios.post(
        //   `https://4wfmtwdd9b.execute-api.ap-northeast-2.amazonaws.com/dev/dormitory`, 
        //   qs.stringify({ id, pw }), {
        //     headers: {
        //         'Content-Type': 'application/json',
        //     }
        //   }
        // )

        //
      } catch(e) {
        console.log({e})
      }
    }
    fetchData()
  }, [])
  return (
    <Wrap>
      <Iframe src='https://4zlfs615gc.execute-api.ap-northeast-2.amazonaws.com/dev/' />
    </Wrap>
  )
}

export default SelectCloud

const Wrap = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
`

const Iframe = styled.iframe`
  width: 100%;
  height: 100%;
`