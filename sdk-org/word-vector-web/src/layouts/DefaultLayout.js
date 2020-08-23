import React from "react";
import styled from "styled-components";

import Header from "../components/common/Header";

const DefaultLayout = ({ children }) => {
  return (
    <Wrap>
      <Header />
      <Container>{children}</Container>
    </Wrap>
  );
};

export default DefaultLayout;

const Wrap = styled.div`
  height: 100%;
  padding: 60px 10px 10px;
  background-color: #f5f5f5;
  // background: #000000;
  // color: #FFFFFF;
`;

const Container = styled.div`
  width: 1024px;
  height: 100%;
  margin: 0 auto;
`;