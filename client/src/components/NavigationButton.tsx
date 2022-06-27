import { CSSProperties, FC } from "react";
import { Link } from "react-router-dom";

export type NavigationButtonProps = {
  label: string,
  destPath: string,
}

const NavigationButton: FC<NavigationButtonProps> = (props) => {
  return (
    <Link to={props.destPath} replace={true}>
      <button style={buttonStyle}>
        {props.label}
      </button>
    </Link>
  )
}


export const buttonStyle: CSSProperties = {
  marginBottom: '8px',
  padding: '4px 16px',
  border: '1.5px solid gray',
  borderRadius: '4px',
  cursor: 'pointer',
  float: 'right',
}

export default NavigationButton
