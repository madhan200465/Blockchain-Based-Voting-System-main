import React from "react";
import { IoIosArrowBack } from "react-icons/io";

interface BackProps {
  call: () => void;
  label?: string;
  ariaLabel?: string;
}

const Back = (props: BackProps) => {
  return (
    <button
      type="button"
      onClick={props.call}
      className="back"
      aria-label={props.ariaLabel || props.label || "Back to dashboard"}
    >
      <span className="icon">
        <IoIosArrowBack />
      </span>
      {props.label || "Back to Dashboard"}
    </button>
  );
};

export default Back;
