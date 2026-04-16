import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./Pages/Auth";
import Prompt from "./Pages/Prompt";
import TestcasesOnly from "./Pages/TestcasesOnly";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/prompt" element={<Prompt />} />
        <Route path="/testcases/:mode/:id" element={<TestcasesOnly />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}

export default App;
