import { useEffect, useState } from 'react';
import StudentTable from './StudentTable';
import axios from 'axios';
import NavigationButton from './NavigationButton';
import { useNavigate } from 'react-router-dom';

export type Student = {
  id: string;
  name: string;
  phone: string | null;
  universityClass: UniversityClass | null;
}

export type UniversityClass = {
  id: number;
  name: string;
}

function HomePage() {
  const [students, setStudents] = useState(Array<Student>())
  const [triggerFetchStudents, setTriggerFetchStudents] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("access-token")
        if (!token) {
          navigate("/")
          return
        }
          
        const response = await axios.get('http://localhost:3000/students', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: {
            filter: {
              where: { username: { neq: "admin" } },
              include: ['universityClass'],
            }
          }
        });
        setStudents(response.data);
      } catch (error) {
        console.log(error)
      }
    }

    fetchStudents();
  }, [triggerFetchStudents])

  const performTriggerFetchStudents = () => {
    setTriggerFetchStudents((prevState) => !prevState)
  }

  return (
    <div style={{
      display: 'table',
      flexDirection: 'column',
    }}>
      <NavigationButton label={"Add"} destPath={"/students/add"} />

      <StudentTable
        students={students}
        onDeleteSuccess={performTriggerFetchStudents}
      />
    </div>
  );
}

export default HomePage;
