import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Student } from "./HomePage"
import './StudentTable.css'

type StudentTableProps = {
  students: Student[]
  onDeleteSuccess: () => void
}

const COLUMN_NAMES = ["Student ID", "Full name", "Class name", "Phone number", "Actions"];

function StudentTable(props: StudentTableProps) {
  const navigate = useNavigate();
  
  const tableHeaders = COLUMN_NAMES.map((item, index) => {
    return <th key={index}>{item}</th>
  })

  const handleDeleteStudent = (studentId: string) => {
    try {
      const url = `http://localhost:3000/students/${studentId}`;
      const token = localStorage.getItem("access-token")

      if (!token) {
        navigate("/")
        return
      }

      const headers = { Authorization: `Bearer ${token}` }
      axios.delete(url, { headers })
      props.onDeleteSuccess()
      alert("Delete successfully")
    } catch (error) {
      console.log({error})
    }
  }

  const studentTableRows = props.students.map((student: Student, index) => {
    return (
      <tr key={student.id}>
        <td>{student.id}</td>
        <td>{student.name}</td>
        <td>{student.universityClass?.name}</td>
        <td>{student.phone}</td>
        <td>
          <div>
            <button
              style={{
                backgroundColor: 'yellow',
                color: 'black',
                padding: '4px 12px',
                border: '0.5px solid black',
                borderRadius: '4px',
                marginRight: '8px',
              }}
              onClick={() => {
                navigate(`/students/edit/${student.id}`, { state: props.students[index] })
              }}
            >
              Edit
            </button>
            
            <button
              style={{
                backgroundColor: 'red',
                color: 'white',
                padding: '4px 12px',
                border: '0.5px solid black',
                borderRadius: '4px',
              }}
              onClick={() => handleDeleteStudent(student.id)}
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    )
  })

  return (
    <table className="table-student">
      <thead>
        <tr>{tableHeaders}</tr>
      </thead>

      <tbody id="table-body-students">
        {studentTableRows}
      </tbody>
    </table>
  );
}

export default StudentTable;
