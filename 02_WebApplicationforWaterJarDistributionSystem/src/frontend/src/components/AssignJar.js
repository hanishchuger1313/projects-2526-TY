import React, { useState } from "react";
import API from "../../utils/api";

const AssignJar = () => {

  const [deliveryBoyId, setDeliveryBoyId] = useState("");
  const [jars, setJars] = useState(1);

  const assignJar = async () => {
    try {

      const res = await API.post("/assign-jar", {
        deliveryBoyId,
        jars
      });

      alert(res.data.message);

    } catch (err) {
      alert("Error assigning jar");
    }
  };

  return (
    <div>
      <h2>Assign Jars</h2>

      <input
        type="text"
        placeholder="Delivery Boy ID"
        onChange={(e)=>setDeliveryBoyId(e.target.value)}
      />

      <input
        type="number"
        placeholder="Jars"
        onChange={(e)=>setJars(e.target.value)}
      />

      <button onClick={assignJar}>
        Assign Jar
      </button>
    </div>
  );
};

export default AssignJar;