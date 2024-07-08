import React, { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import WeeklyRevenue from "views/admin/default/components/WeeklyRevenue";
import TotalSpent from "views/admin/default/components/TotalSpent";
import PieChartCard from "views/admin/default/components/PieChartCard";
import { IoDocuments } from "react-icons/io5";
import { MdBarChart } from "react-icons/md";
import Widget from "components/widget/Widget";
import ComplexTable from "views/admin/default/components/ComplexTable";
import { columnsDataComplex } from "./variables/columnsData";

const Dashboard = () => {
  const [totalActiveProducts, setTotalActiveProducts] = useState(null);
  const [totalProductSales, setTotalProductSales] = useState(null);
  const [totalProfit, setTotalProfit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const fetchTotalActiveProducts = async () => {
      try {
        const response = await axios.get("https://retailflash.up.railway.app/api/products/data/totalactive");
        setTotalActiveProducts(response.data.total);
      } catch (error) {
        console.error("Error fetching total active products:", error);
      }
    };

    const fetchTransactionsData = async () => {
      try {
        const response = await axios.get("https://retailflash.up.railway.app/api/transactions/get");
        const transactions = response.data;

        let productSales = 0;
        let profit = 0;

        const transformedData = transactions.map(transaction => {
          productSales += transaction.totalPrice;

          transaction.productsList.forEach(product => {
            profit += product.productUid.sellingPrice - product.productUid.price;
          });

          return {
            id: transaction._id,
            customerName: transaction.userCustomerId.name,
            totalPrice: transaction.totalPrice,
            products: transaction.productsList.map(product => product.productUid.name).join(', '),
            paymentMethod: transaction.paymentMethod,
            date: new Date(transaction.createdAt).toLocaleDateString(),
            status: transaction.productsList.every(product => product.productUid.status === "inactive") ? "Completed" : "Pending"
          };
        });

        setTotalProductSales(productSales);
        setTotalProfit(profit);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching transactions data:", error);
        setIsLoading(false); // Set loading to false even if there's an error
      }
    };

    const fetchLastProducts = async () => {
      try {
        const response = await axios.get("https://retailflash.up.railway.app/api/products/fourproducts/last");
        setTableData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching last products:", error);
        setIsLoading(false); // Set loading to false even if there's an error
      }
    };

    fetchTotalActiveProducts();
    fetchTransactionsData();
    fetchLastProducts();
  }, []);

  return (
    <div>
      {/* Card widget */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Total Products"}
          subtitle={totalActiveProducts !== null ? totalActiveProducts : <Skeleton width={50} />}
        />
        <Widget
          icon={<IoDocuments className="h-6 w-6" />}
          title={"Total Sales"}
          subtitle={totalProductSales !== null ? `$${totalProductSales.toFixed(2)}` : <Skeleton width={50} />}
        />
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title={"Total Profit"}
          subtitle={totalProfit !== null ? `$${totalProfit.toFixed(2)}` : <Skeleton width={50} />}
        />
      </div>

      {/* Charts */}
      <div className="mt-5 grid grid-cols-1  h-64">
        <TotalSpent />
       
      </div>
      {/* <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
       
        <WeeklyRevenue />
      </div> */}
      {/* Tables & Charts */}
      <div className="mt-5 grid grid-cols-1 ">
         {/* Check Table */}
         <ComplexTable
          columnsData={[
            { Header: 'NAME', accessor: 'name' },
            { Header: 'STATUS', accessor: 'status' },
            { Header: 'DATE', accessor: 'createdAt' },
          ]}
          tableData={tableData}
          isLoading={isLoading}
        />
        {/* <PieChartCard /> */}
      </div>
    </div>
  );
};

export default Dashboard;
