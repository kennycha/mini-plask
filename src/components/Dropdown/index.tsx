import React, { FunctionComponent, useState } from "react";
import styled from "styled-components";
import { Option } from "../../types";
import DropdownItem from "./DropdownItem";

interface Props {
  options: Option[];
}

const Dropdown: FunctionComponent<Props> = ({ options }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentValue, setCurrentValue] = useState<string>();

  return (
    <Container>
      <div className="current" onClick={() => setIsOpen((prev) => !prev)}>
        {currentValue ?? "not selected"}
      </div>
      {isOpen && (
        <ul>
          {options.map((option, idx) => {
            const handleSelect = () => {
              setCurrentValue(option.value);
              setIsOpen(false);
              option.onSelect();
            };

            return (
              <DropdownItem
                key={`${option.value}_${idx}`}
                value={option.value}
                onSelect={handleSelect}
              />
            );
          })}
        </ul>
      )}
    </Container>
  );
};

export default Dropdown;

const Container = styled.div`
  position: relative;
  width: 220px;
  font-size: 13.33px;
  background-color: rgb(239, 239, 239);

  .current {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 22px;
    overflow-x: hidden;
    cursor: pointer;
  }

  ul {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 24px;
    width: 100%;
    max-height: calc(22px * 5);
    overflow-y: scroll;
    margin: 0;
    padding: 0;
  }
`;
