import React from "react";
import { Chart } from "react-google-charts";

const Card = (count) => {
  const value = [
    ["Task", "STATUS"],
    [`OPEN ${count}`, 5],
    [`BLOCKED${count}`, 7],
    [`PROGRESS${count}`, 2],
    [`CLOSED${count}`, 2],
    
  ];
  return (
    <div className="Chart d-flex justify-content-end align-item-center vh-100">
      <Chart
        chartType="PieChart"
        data={value}
        options={{ title: "STATUS", is3D: true }}
        width={"90%"}
        height={"60vh"}
      />
    </div>
  );
};
export default Card;
