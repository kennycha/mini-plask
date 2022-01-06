import styled from "styled-components";
import React, { FunctionComponent } from "react";
import { Option } from "../../../types";

type Props = Option;

const DropdownItem: FunctionComponent<Props> = ({ value, onSelect }) => {
  return <Container onClick={onSelect}>{value}</Container>;
};

export default DropdownItem;

const Container = styled.li`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 220px;
  height: 22px;
  background-color: rgb(239, 239, 239);
  font-size: 13.33px;
  overflow-x: hidden;
`;
