import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MdArrowDropUp,
  MdOutlineCalendarToday,
  MdBarChart,
} from "react-icons/md";
import Card from "components/card";
import LineChart from "components/charts/LineChart";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import { lineChartOptionsTotalSpent } from "variables/charts";

const TotalSpent = () => {
  const [lineChartDataTotalSpent, setLineChartDataTotalSpent] = useState([]);
  const [totalProfit, setTotalProfit] = useState(null);
  const [previousProfit, setPreviousProfit] = useState(null);
  const [categories, setCategories] = useState([]); // For dynamic x-axis categories

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get("https://retailflash.up.railway.app/api/transactions/profit/month");
        const { sellingPrices, costPrices } = response.data;

        // Calculate total profit
        const totalSellingPrice = sellingPrices.reduce((a, b) => a + b, 0);
        const totalCostPrice = costPrices.reduce((a, b) => a + b, 0);
        const totalProfit = totalSellingPrice - totalCostPrice;

        // Set total and previous profit
        setTotalProfit(totalProfit);
        // For demonstration, setting previous profit as a static value. You can update this logic as needed.
        setPreviousProfit(100); // Example previous profit

        // Prepare data for chart
        const daysInMonth = sellingPrices.length; // Use the length of the data
        const dailySellingPrices = Array(daysInMonth).fill(0);
        const dailyCostPrices = Array(daysInMonth).fill(0);

        // Distribute prices across the days of the month
        sellingPrices.forEach((price, index) => {
          dailySellingPrices[index] += price;
        });
        costPrices.forEach((price, index) => {
          dailyCostPrices[index] += price;
        });

        setLineChartDataTotalSpent([
          { name: "Selling Price", data: dailySellingPrices },
          { name: "Cost Price", data: dailyCostPrices },
        ]);

        // Set categories for x-axis
        setCategories(Array.from({ length: daysInMonth }, (_, i) => i + 1));
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  // Calculate percentage change
  const percentageChange = previousProfit !== null && totalProfit !== null
    ? ((totalProfit - previousProfit) / previousProfit) * 100
    : null;

  const lineChartOptions = {
    ...lineChartOptionsTotalSpent,
    xaxis: {
      ...lineChartOptionsTotalSpent.xaxis,
      categories: categories,
    },
  };

  return (
    <Card extra="!p-[20px] text-center">
      <div className="flex justify-between">
        <button className="linear mt-1 flex items-center justify-center gap-2 rounded-lg bg-lightPrimary p-2 text-gray-600 transition duration-200 hover:cursor-pointer hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:hover:opacity-90 dark:active:opacity-80">
          <MdOutlineCalendarToday />
          <span className="text-sm font-medium text-gray-600">This month</span>
        </button>
        <button className="!linear z-[1] flex items-center justify-center rounded-lg bg-lightPrimary p-2 text-[#DC143C] !transition !duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10">
          <MdBarChart className="h-6 w-6" />
        </button>
      </div>

      <div className="flex h-full w-full flex-row justify-between sm:flex-wrap lg:flex-nowrap 2xl:overflow-hidden">
        <div className="flex flex-col">
          <p className="mt-[20px] text-3xl font-bold text-navy-700 dark:text-white">
            {totalProfit !== null ? `$${totalProfit.toFixed(2)}` : <Skeleton width={50} />}
          </p>
          <div className="flex flex-col items-start">
            <p className="mt-2 text-sm text-gray-600">Total Profit</p>
            <div className="flex flex-row items-center justify-center">
              <MdArrowDropUp className="font-medium text-green-500" />
              <p className="text-sm font-bold text-green-500">
                {percentageChange !== null ? `+${percentageChange.toFixed(2)}%` : <Skeleton width={50} />}
              </p>
            </div>
          </div>
        </div>
        <div className="h-full w-full">
          <LineChart
            options={lineChartOptions}
            series={lineChartDataTotalSpent}
          />
        </div>
      </div>
    </Card>
  );
};

export default TotalSpent;
