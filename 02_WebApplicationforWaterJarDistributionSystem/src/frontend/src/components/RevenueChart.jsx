import React from "react";
import { Bar } from "react-chartjs-2";
import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
Title,
Tooltip,
Legend
} from "chart.js";

ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
Title,
Tooltip,
Legend
);

const RevenueChart = ({orders}) => {

const revenueData = {};

orders.forEach(order=>{

const date = new Date(order.createdAt).toLocaleDateString();

if(order.status === "Delivered"){
revenueData[date] =
(revenueData[date] || 0) + order.totalAmount;
}

});

const data = {
labels:Object.keys(revenueData),
datasets:[
{
label:"Revenue",
data:Object.values(revenueData),
backgroundColor:"#10b981"
}
]
};

return(

<div style={{background:"white",padding:"20px",borderRadius:"10px"}}>
<h3>Revenue</h3>
<Bar data={data}/>
</div>

);

};

export default RevenueChart;