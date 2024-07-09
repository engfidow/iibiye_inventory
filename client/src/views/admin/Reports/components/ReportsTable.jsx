import React, { useEffect, useState } from "react";
import MUIDatatable from "mui-datatables";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Widget from "components/widget/Widget";
import { MdBarChart } from "react-icons/md";
import { IoDocuments } from "react-icons/io5";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from "../../../../assets/logo.png";
function ReportsTable() {
  const MuiCache = createCache({
    key: "mui-datatables",
    prepend: true
  });

  const [reportType, setReportType] = useState('month');
  const [reportData, setReportData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchReportData = async (type) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://iibiye.up.railway.app/api/transactions/report/${type}`);
      setTotalSales(response.data.totalSales);
      setTotalProfit(response.data.totalProfit);
      setReportData(response.data.transactions);
    } catch (error) {
      console.error('Error fetching report data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReportData(reportType);
  }, [reportType]);

  const columns = [
    "No",
    "Transaction ID",
    "Customer Name",
    "Product Names",
    "Product Categories",
    "Product Selling Prices",
    "Payment Method",
    "Payment Phone",
    "Total Price",
    "Date & Time"
  ];

  const options = {
    responsive: "vertical",
    tableBodyHeight: "400px"
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  const formatDateTime = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getTitle = () => {
    switch (reportType) {
      case 'week':
        return 'This Week\'s';
      case 'month':
        return 'This Month\'s';
      case 'year':
        return 'This Year\'s';
      default:
        return 'Transactions';
    }
  };

  const downloadData = async (format) => {
    const filteredTransactions = reportData.map(transaction => ({
      id: transaction._id,
      customerName: transaction.userCustomerId.name,
      productNames: transaction.productsList.map(p => p.productUid.name).join(", "),
      productCategories: transaction.productsList.map(p => p.productUid.category.name).join(", "),
      productSellingPrices: transaction.productsList.map(p => `$${p.productUid.sellingPrice}`).join(", "),
      paymentMethod: transaction.paymentMethod,
      paymentPhone: transaction.paymentPhone,
      totalPrice: `$${transaction.totalPrice}`,
      date: formatDateTime(transaction.createdAt),
    }));

    if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(filteredTransactions);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, `${getTitle()}.xlsx`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();

      const img = new Image();
      img.src = logo; // Update this path
      img.onload = () => {
        const logoWidth = 20; // Adjust logo width
        const logoHeight = 20; // Adjust logo height
        const logoX = 10; // Adjust logo X position
        const logoY = 10; // Adjust logo Y position

        doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);
        doc.setFontSize(20);
        doc.text('Iibiye', 60, 20);
        doc.setFontSize(14);
        doc.text(`${getTitle()} Report`, 60, 30);

        const columns = ['Transaction ID', 'Customer Name', 'Product Names', 'Product Categories', 'Product Selling Prices', 'Payment Method', 'Payment Phone', 'Total Price', 'Date & Time'];
        const rows = filteredTransactions.map(transaction => [
          transaction.id,
          transaction.customerName,
          transaction.productNames,
          transaction.productCategories,
          transaction.productSellingPrices,
          transaction.paymentMethod,
          transaction.paymentPhone,
          transaction.totalPrice,
          transaction.date,
        ]);

        doc.autoTable({
          startY: 40,
          head: [columns],
          body: rows,
        });

        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(10);
        doc.text('© 2024 Iibiye', 10, pageHeight - 10);
        doc.text('Contact: +252 612910628 | Iibiye@info.com', 10, pageHeight - 5);

        doc.save(`${getTitle()} Report.pdf`);
      };
    }
  };

  return (
    <div className='e-container p-4'>
      <div className="report-type-selector mb-4">
        <label htmlFor="reportType" className='mr-2 font-semibold'>Select Report Type:</label>
        <select id="reportType" value={reportType} onChange={handleReportTypeChange} className='border rounded p-2'>
          <option value="month">This Month</option>
          <option value="week">This Week</option>
          <option value="year">This Year</option>
        </select>
      </div>
     
      <div className="my-10 items-center justify-between grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2 ">
        {loading ? (
          <>
            <Skeleton height={150} />
            <Skeleton height={150} />
          </>
        ) : (
          <>
            <Widget
              icon={<MdBarChart className="h-7 w-7" />}
              title={"Total Sales"}
              subtitle={`$${totalSales.toFixed(2)}`}
            />
            <Widget
              icon={<IoDocuments className="h-6 w-6" />}
              title={"Total Profit"}
              subtitle={`$${totalProfit.toFixed(2)}`}
            />
          </>
        )}
      </div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => downloadData('xlsx')}
          className="flex gap-3 focus:outline-none text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Download XLSX
        </button>
        <button
          onClick={() => downloadData('pdf')}
          className="flex gap-3 focus:outline-none text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Download PDF
        </button>
      </div>
      <CacheProvider value={MuiCache}>
        <ThemeProvider theme={createTheme()}>
          {loading ? (
            <Skeleton count={10} height={40} />
          ) : (
            <MUIDatatable
              title={`${getTitle()} Transactions`}
              data={reportData.map((transaction, index) => [
                index + 1,
                transaction._id,
                transaction.userCustomerId.name,
                transaction.productsList.map(p => p.productUid.name).join(", "),
                transaction.productsList.map(p => p.productUid.category.name).join(", "),
                transaction.productsList.map(p => `$${p.productUid.sellingPrice}`).join(", "),
                transaction.paymentMethod,
                transaction.paymentPhone,
                `$${transaction.totalPrice}`,
                formatDateTime(transaction.createdAt)
              ])}
              columns={columns}
              options={options}
            />
          )}
        </ThemeProvider>
      </CacheProvider>
    </div>
  );
}

export default ReportsTable;
