import { Admin, Resource } from "react-admin";

const App = () => {
  return (
    <Admin>
      <Resource name="accounts" />
    </Admin>
  );
}

export default App;
