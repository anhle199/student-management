import axios from "axios";
import { CSSProperties, FC } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

type LoginPageProps = {}

type FormInputs = {
  username: string,
  password: string,
}

const requiredErrorMessage = "This field is required"

const LoginPage: FC<LoginPageProps> = (props) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>()
  const navigate = useNavigate()

  const onSubmit: SubmitHandler<FormInputs> = async (formData) => {
    try {
      const headers = {
        headers: {
          "Content-Type": "application/json",
        },
      }

      const {data: {token}} = await axios.post("http://localhost:3000/accounts/login", formData, headers)

      localStorage.setItem("access-token", token)
      navigate("/students", {state: "This is a state."}) // back to home page (student table)
    } catch (error) {
      alert("Something went wrong.")
      console.log({ error });
    }
  }

  return (
    <form style={formStyle} onSubmit={handleSubmit(onSubmit)}>
      <div style={inputFieldContainer}>
        <label style={labelStyle} htmlFor="username-field">Username</label>
        <div style={inputWithErrorMessageStyle}>
          <input
            style={inputStyle}
            type="text"
            id="username-field"
            autoFocus
            {...register("username", { required: true })}
          />

          {errors.username && <span style={errorMessageStyle}>{requiredErrorMessage}</span>}
        </div>
      </div>

      <div style={inputFieldContainer}>
        <label style={labelStyle} htmlFor="password-field">Password</label>
        <div style={inputWithErrorMessageStyle}>
          <input
            style={inputStyle}
            type="password"
            id="password-field"
            {...register("password", { required: true })}
          />

          {errors.password && <span style={errorMessageStyle}>{requiredErrorMessage}</span>}
        </div>
      </div>

      <input style={{ height: '28px', marginTop: '8px' }} type="submit" value="Login" />
    </form>
  )
}

const formStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: 'fit-content',
  marginBottom: '40px',
  border: '1.5px solid gray',
  padding: '16px',
  borderRadius: '8px',
}

const inputFieldContainer: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'baseline',
  marginBottom: '12px',
}

const labelStyle: CSSProperties = {
  flex: '1',
  height: '28px',
  marginRight: '24px',
  marginBottom: '4px',
}

const inputWithErrorMessageStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '200px',
  flexWrap: 'wrap',
}

const inputStyle: CSSProperties = {
  height: '28px',
  width: '200px',
  boxSizing: 'border-box',
}

const errorMessageStyle: CSSProperties = {
  color: 'red',
  fontSize: '0.7em',
  marginTop: '2px'
}

export default LoginPage