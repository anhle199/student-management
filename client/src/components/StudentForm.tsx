import axios from 'axios';
import { CSSProperties, FC, useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { Student, UniversityClass } from './HomePage';
import NavigationButton from './NavigationButton';

export type StudentFormProps = {
  mode: "create" | "edit",
  positiveButtonLabel: string,
}

type FormInputs = {
  id: string,
  name: string,
  phone: string,
  universityClassId: number | string,
}

type StudentRequestSchema = {
  id?: string,
  name: string,
  phone?: string,
  universityClassId?: number,
}

const requiredErrorMessage = "This field is required"
const noneUniversityClass: UniversityClass = { id: -1, name: "None" }

const StudentForm: FC<StudentFormProps> = (props) => {
  const [universityClasses, setUniversityClasses] = useState<UniversityClass[]>([]);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputs>()

  // Router dom
  const navigate = useNavigate()
  const location = useLocation()


  const isCreateMode = () => props.mode === "create";

  const onSubmit: SubmitHandler<FormInputs> = async (formData) => {
    const requestedStudent: StudentRequestSchema = { name: formData.name }
    console.log(formData)
    if (formData.phone.length > 0) {
      requestedStudent["phone"] = formData.phone;
    }
    if (formData.universityClassId && Number(formData.universityClassId) !== noneUniversityClass.id) {
      requestedStudent["universityClassId"] = Number(formData.universityClassId);
    }

    try {
      const token = localStorage.getItem("access-token")
      if (!token) {
        navigate("/")
        return
      }

      let url = "http://localhost:3000/students/";
      let method: string;

      if (isCreateMode()) {
        requestedStudent.id = formData.id;
        method = "post";
      } else {
        url += formData.id;
        method = "patch";
      }
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      await axios({ method, url, headers, data: requestedStudent })
      alert("Create successfully.")
      navigate("/students") // back to home page (student table)
    } catch (error) {
      alert("Something went wrong.")
      console.log({ error });
    }
  }

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem("access-token")
        if (!token) {
          navigate("/")
          return
        }

        const response = await axios.get('http://localhost:3000/classes', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        setUniversityClasses([noneUniversityClass, ...response.data]);
      } catch (error) {
        console.log(error)
      }
    }

    fetchClasses();
  }, [])

  // Set values for all fields when pressing "Edit" button at the home page.
  useEffect(() => {
    if (location.state) {
      const student = location.state as Student;

      reset({
        id: student.id,
        name: student.name,
        phone: student.phone ?? "",
        universityClassId: student.universityClass ? student.universityClass.id : noneUniversityClass.id
      })
    } else if (!isCreateMode()) { // user access to the edit page from endpoint => deny and back to home.
      navigate("/")
    }
  }, [location.state])

  return (
    <div style={rootContainerStyle}>
      <div style={{
        width: 'fit-content',
        float: 'left',
        marginBottom: '12px',
      }}>
        <NavigationButton label={"< Home"} destPath={"/students"} />
      </div>

      <form style={formStyle} onSubmit={handleSubmit(onSubmit)}>
        <div style={inputFieldContainer}>
          <label style={labelStyle} htmlFor="id-field">Student ID</label>
          <div style={inputWithErrorMessageStyle}>
            <input
              style={inputStyle}
              type="text"
              id="id-field"
              autoFocus
              readOnly={!isCreateMode()}
              {...register("id", { required: true })}
            />

            {errors.id && <span style={errorMessageStyle}>{requiredErrorMessage}</span>}
          </div>
        </div>

        <div style={inputFieldContainer}>
          <label style={labelStyle} htmlFor="name-field">Student Name</label>
          <div style={inputWithErrorMessageStyle}>
            <input
              style={inputStyle}
              type="text"
              id="name-field"
              {...register("name", { required: true })}
            />

            {errors.name && <span style={errorMessageStyle}>{requiredErrorMessage}</span>}
          </div>
        </div>

        <div style={inputFieldContainer}>
          <label style={labelStyle} htmlFor="phone-field">Phone Number</label>
          <div style={inputWithErrorMessageStyle}>
            <input
              style={inputStyle}
              type="tel"
              id="phone-field"
              {...register("phone", { pattern: /0[0-9]{9}/ })}
            />
            {errors.id && <span style={errorMessageStyle}>Phone number must contain 10 digits and begin with zero.</span>}
          </div>
        </div>

        {
          universityClasses.length > 0 &&
          <div style={inputFieldContainer}>
            <label style={labelStyle} htmlFor="class-field">Class</label>
            <select style={inputStyle} id="class-field" {...register("universityClassId", {valueAsNumber: true})}>
              {
                universityClasses.map(item => {
                  return <option key={item.id} value={item.id}>{item.name}</option>
                })
              }
            </select>
          </div>
        }

        <div style={buttonContainerStyle}>
          <input style={{ height: '28px', marginRight: '12px', width: '100%' }} type="submit" />
          <button style={{ height: '28px', width: '100%' }} onClick={() => reset()} >Clear</button>
        </div>
      </form>
    </div>
  )
}

const rootContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
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
  alignItems: 'baseline',
  marginBottom: '12px',
}

const labelStyle: CSSProperties = {
  flex: '1',
  height: '28px',
  marginRight: '24px',
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

const buttonContainerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center'
}

export default StudentForm
