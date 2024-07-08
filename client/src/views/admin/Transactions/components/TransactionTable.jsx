import { React, useEffect, useState } from "react";
import MUIDatatable from "mui-datatables";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import axios from 'axios';
import Modal from 'react-modal';
import CircularProgress from '@mui/material/CircularProgress';
import { TextField } from '@mui/material';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from "../../../../assets/logo.png";
function TransactionTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [Transaction, setTransaction] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const MuiCache = createCache({
    key: "mui-datatables",
    prepend: true
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('https://retailflash.up.railway.app/api/transactions/get');
      console.log('Fetched Transactions:', response.data);
      setTransaction(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRowClick = (rowData, rowMeta) => {
    const selectedRowIndex = rowMeta.dataIndex;
    const selectedTransaction = Transaction[selectedRowIndex];
    setSelectedTransaction(selectedTransaction);
    setIsModalOpen(true);
  };

  const handleDateChange = (field, value) => {
    if (field === 'start') {
      setStartDate(value);
    } else if (field === 'end') {
      setEndDate(value);
    }
  };

  const filteredTransactions = Transaction.filter(transaction => {
    const transactionDate = new Date(transaction.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || transactionDate >= start) && (!end || transactionDate <= end);
  });

  const formatCurrency = (value) => {
    return `$${value.toFixed(2)}`;
  };

  const calculateProfit = (productsList) => {
    return productsList.reduce((acc, product) => acc + (product.productUid.sellingPrice - product.productUid.price), 0);
  };

  const getProfitColor = (profit) => {
    return profit >= 0 ? 'green' : 'red';
  };

  const columns = [
    { name: "No", options: { customBodyRenderLite: (dataIndex) => dataIndex + 1 } },
    "Transaction ID",
    "User Name",
    "Product Names",
    "Product Categories",
    "Product Selling Prices",
    {
      name: "Total Price",
      options: {
        customBodyRender: (value) => formatCurrency(value)
      }
    },
    {
      name: "Profit",
      options: {
        customBodyRender: (value) => (
          <span style={{ color: getProfitColor(value) }}>{formatCurrency(value)}</span>
        )
      }
    },
    "Date"
  ];

  const options = {
    onRowClick: handleRowClick,
  };

  const formatDateTime = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const downloadData = async (format) => {
    const filteredTransactions = Transaction.map(transaction => ({
      id: transaction._id,
      userName: transaction.userCustomerId.name,
      productNames: transaction.productsList.map(p => p.productUid.name).join(", "),
      productCategories: transaction.productsList.map(p => p.productUid.category.name).join(", "),
      productSellingPrices: transaction.productsList.map(p => `$${p.productUid.sellingPrice}`).join(", "),
      totalPrice: formatCurrency(transaction.totalPrice),
      profit: formatCurrency(calculateProfit(transaction.productsList)),
      date: formatDateTime(transaction.createdAt),
    }));

    if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(filteredTransactions);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'transactions.xlsx');
    } else if (format === 'pdf') {
      const doc = new jsPDF();

      // Add logo
      const img = new Image();
      img.src = logo; // Update this path
      img.onload = () => {
        const logoWidth = 20; // Adjust logo width
        const logoHeight = 20; // Adjust logo height
        const logoX = 10; // Adjust logo X position
        const logoY = 10; // Adjust logo Y position

        doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);
        doc.setFontSize(20);
        doc.text('Retail Flash', 60, 20);
        doc.setFontSize(14);
        doc.text('Transactions Report', 60, 30);

        const columns = ['Transaction ID', 'User Name', 'Product Names', 'Product Categories', 'Product Selling Prices', 'Total Price', 'Profit', 'Date'];
        const rows = filteredTransactions.map(transaction => [
          transaction.id,
          transaction.userName,
          transaction.productNames,
          transaction.productCategories,
          transaction.productSellingPrices,
          transaction.totalPrice,
          transaction.profit,
          transaction.date,
        ]);

        doc.autoTable({
          startY: 40,
          head: [columns],
          body: rows,
        });

        // Add footer
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(10);
        doc.text('© 2024 Retail Flash', 10, pageHeight - 10);
        doc.text('Contact: +252 612910628 | retailflash@info.com', 10, pageHeight - 5);

        doc.save('transactions.pdf');
      };
    }
  };

  return (
    <div className='e-container'>
      <div className="flex justify-between mb-4">
        <div>
          <label className="mr-2">Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleDateChange('start', e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="mr-2">End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange('end', e.target.value)}
            className="border p-2 rounded"
          />
        </div>
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

      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <CircularProgress />
        </div>
      ) : (
        <>
          <Modal
            className="bg-white bg-cover bg-center rounded-lg mx-auto p-6 fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg overflow-auto"
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            contentLabel="Transaction Details Modal"
            style={{ 
              overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                zIndex: 999,
              },
              content: { 
                width: '80%', 
                height: '80%', 
                maxHeight: '90%', 
                maxWidth: '90%', 
                backgroundImage: `url('/mnt/data/image.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                padding: '20px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              } 
            }}
          >
            {selectedTransaction && (
              <div className="overflow-auto max-h-full">
                <h2 className="text-2xl font-bold mb-4">Transaction Details</h2>
                <div className="mb-4 text-[#000]">
                  <strong>Transaction ID:</strong> {selectedTransaction._id}
                </div>
                <div className="mb-4 text-[#000]">
                  <strong>User Name:</strong> {selectedTransaction.userCustomerId.name}
                </div>
                <div className="mb-4 text-[#000]">
                  <strong>Payment Phone:</strong> {selectedTransaction.paymentPhone}
                </div>
                <div className="mb-4 text-[#000]">
                  <strong>Total Price:</strong> {formatCurrency(selectedTransaction.totalPrice)}
                </div>
                <div className="mb-4 text-[#000]" style={{ color: getProfitColor(calculateProfit(selectedTransaction.productsList)) }}>
                  <strong>Profit:</strong> {formatCurrency(calculateProfit(selectedTransaction.productsList))}
                </div>
                <div className="mb-4 text-[#000]">
                  <strong>Date:</strong> {new Date(selectedTransaction.createdAt).toLocaleDateString()}
                </div>
                <div className="mb-4 text-[#000]">
                  <h3 className="text-xl font-semibold">Products:</h3>
                  {selectedTransaction.productsList.map((product, index) => (
                    <div key={index} className="flex mb-4 items-center bg-white pl-4 rounded-md shadow-inner w-96">
                      <img src={`https://retailflash.up.railway.app/${product.productUid.image}`} alt={product.productUid.name} className="w-16 h-16 mr-4 rounded-lg"/>
                      <div>
                        <div><strong>Name:</strong> {product.productUid.name}</div>
                        <div><strong>Price:</strong> {formatCurrency(product.productUid.sellingPrice)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="bg-blue-500 mb-10 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            )}
          </Modal>

          <CacheProvider value={MuiCache}>
            <ThemeProvider theme={createTheme()}>
              <MUIDatatable
                title={"Transaction List"}
                data={filteredTransactions.map((transaction, index) => [
                  index + 1,
                  transaction._id,
                  transaction.userCustomerId.name,
                  transaction.productsList.map(p => p.productUid.name).join(", "),
                  transaction.productsList.map(p => p.productUid.category.name).join(", "),
                  transaction.productsList.map(p => `$${p.productUid.sellingPrice}`).join(", "),
                  transaction.totalPrice,
                  calculateProfit(transaction.productsList),
                  formatDateTime(transaction.createdAt)
                ])}
                columns={columns}
                options={options}
              />
            </ThemeProvider>
          </CacheProvider>
        </>
      )}
    </div>
  );
}

export default TransactionTable;
