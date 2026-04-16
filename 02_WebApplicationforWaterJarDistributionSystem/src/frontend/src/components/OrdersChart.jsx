import React from "react";
import { Line } from "react-chartjs-2";
import {
Chart as ChartJS,
CategoryScale,
LinearScale,
PointElement,
LineElement,
Title,
Tooltip,
Legend
} from "chart.js";

ChartJS.register(
CategoryScale,
LinearScale,
PointElement,
LineElement,
Title,
Tooltip,
Legend
);

const OrdersChart = ({orders}) => {

const dailyOrders = {};

orders.forEach(order=>{
const date = new Date(order.createdAt).toLocaleDateString();
dailyOrders[date] = (dailyOrders[date] || 0) + 1;
});

const data = {
labels:Object.keys(dailyOrders),
datasets:[
{
label:"Orders",
data:Object.values(dailyOrders),
borderColor:"#2563eb",
backgroundColor:"#93c5fd",
tension:0.4
}
]
};

return(

<div style={{background:"white",padding:"20px",borderRadius:"10px"}}>
<h3>Orders Trend</h3>
<Line data={data}/>
</div>

);

};

export default OrdersChart;