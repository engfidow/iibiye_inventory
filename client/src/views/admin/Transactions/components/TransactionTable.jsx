import React, { useEffect, useState } from "react";
import MUIDataTable from "mui-datatables";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import Modal from "react-modal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FiDownload } from "react-icons/fi";

const TransactionTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const formatCurrency = (val) => `$${parseFloat(val).toFixed(2)}`;
  const getProfitColor = (val) => val >= 0 ? "text-green-600" : "text-red-600";
  const MuiCache = createCache({ key: "mui-datatables", prepend: true });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("https://iibiye-inventory.onrender.com/api/transactions/get");
        setTransactions(res.data);
      } catch (err) {
        console.error("Fetch error", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = transactions.filter((tx) => {
    const txDate = new Date(tx.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || txDate >= start) && (!end || txDate <= end);
  });

  const columns = [
    { name: "No", options: { customBodyRenderLite: (i) => i + 1 } },
    { name: "Transaction ID", options: { customBodyRenderLite: (i) => filtered[i]._id } },
    { name: "User Name", options: { customBodyRenderLite: (i) => filtered[i].userCustomerId?.name || 'N/A' } },
    {
      name: "Products",
      options: {
        customBodyRenderLite: (i) =>
          filtered[i].productsList.map(p => p.productUid.name).join(", ")
      }
    },
    {
      name: "Price",
      options: {
        customBodyRenderLite: (i) =>
          formatCurrency(filtered[i].productsList.reduce((sum, p) => sum + p.productUid.price, 0))
      }
    },
    {
      name: "Selling Price",
      options: {
        customBodyRenderLite: (i) =>
          formatCurrency(filtered[i].productsList.reduce((sum, p) => sum + p.productUid.sellingPrice, 0))
      }
    },
    {
      name: "Profit",
      options: {
        customBodyRenderLite: (i) => {
          const totalProfit = filtered[i].productsList.reduce(
            (sum, p) => sum + (p.productUid.sellingPrice - p.productUid.price),
            0
          );
          return <span className={getProfitColor(totalProfit)}>{formatCurrency(totalProfit)}</span>;
        }
      }
    },
    {
      name: "Date",
      options: {
        customBodyRenderLite: (i) =>
          new Date(filtered[i].createdAt).toLocaleString()
      }
    }
  ];

  const handleRowClick = (_, meta) => {
    setSelectedTransaction(filtered[meta.dataIndex]);
    setModalOpen(true);
  };

  const exportToExcel = () => {
    const worksheetData = filtered.map((tx, i) => ({
      No: i + 1,
      "Transaction ID": tx._id,
      "User Name": tx.userCustomerId?.name || 'N/A',
      Products: tx.productsList.map(p => p.productUid.name).join(", "),
      Price: tx.productsList.reduce((sum, p) => sum + p.productUid.price, 0),
      "Selling Price": tx.productsList.reduce((sum, p) => sum + p.productUid.sellingPrice, 0),
      Profit: tx.productsList.reduce((sum, p) => sum + (p.productUid.sellingPrice - p.productUid.price), 0),
      Date: new Date(tx.createdAt).toLocaleString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, "transactions.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Transaction Report", 14, 10);
    const tableData = filtered.map((tx, i) => [
      i + 1,
      tx._id,
      tx.userCustomerId?.name || 'N/A',
      tx.productsList.map(p => p.productUid.name).join(", "),
      `$${tx.productsList.reduce((sum, p) => sum + p.productUid.price, 0).toFixed(2)}`,
      `$${tx.productsList.reduce((sum, p) => sum + p.productUid.sellingPrice, 0).toFixed(2)}`,
      `$${tx.productsList.reduce((sum, p) => sum + (p.productUid.sellingPrice - p.productUid.price), 0).toFixed(2)}`,
      new Date(tx.createdAt).toLocaleString(),
    ]);
    doc.autoTable({
      head: [["No", "Transaction ID", "User", "Products", "Price", "Selling", "Profit", "Date"]],
      body: tableData
    });
    doc.save("transactions.pdf");
  };

  return (
    <div className="p-6 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Transaction Report</h2>

      <div className="flex gap-4 mb-4">
        <div>
          <label className="mr-1 font-medium">Start Date:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border px-2 py-1 rounded" />
        </div>
        <div>
          <label className="mr-1 font-medium">End Date:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border px-2 py-1 rounded" />
        </div>
        <button onClick={exportToExcel} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1">
          <FiDownload /> Excel
        </button>
        <button onClick={exportToPDF} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center gap-1">
          <FiDownload /> PDF
        </button>
      </div>

      {isLoading ? (
        <Skeleton count={10} height={30} />
      ) : (
        <CacheProvider value={MuiCache}>
          <ThemeProvider theme={createTheme()}>
            <MUIDataTable
              title={"Transactions"}
              data={filtered}
              columns={columns}
              options={{
                filter: true,
                responsive: "standard",
                onRowClick: handleRowClick,
                selectableRows: "none"
              }}
            />
          </ThemeProvider>
        </CacheProvider>
      )}

      <Modal isOpen={modalOpen} onRequestClose={() => setModalOpen(false)} className="bg-white p-6 max-w-2xl mx-auto mt-20 rounded shadow-md">
        {selectedTransaction && (
          <>
            <h3 className="text-lg font-semibold mb-2">Transaction Details</h3>
            <p><strong>ID:</strong> {selectedTransaction._id}</p>
            <p><strong>User:</strong> {selectedTransaction.userCustomerId?.name}</p>
            <p><strong>Phone:</strong> {selectedTransaction.paymentPhone}</p>
            <p><strong>Date:</strong> {new Date(selectedTransaction.createdAt).toLocaleString()}</p>
            <h4 className="mt-4 font-medium">Products:</h4>
            <ul className="list-disc pl-6">
              {selectedTransaction.productsList.map((p, i) => (
                <li key={i}>
                  {p.productUid.name} – Price: {formatCurrency(p.productUid.price)}, Selling: {formatCurrency(p.productUid.sellingPrice)}
                </li>
              ))}
            </ul>
            <button onClick={() => setModalOpen(false)} className="mt-4 bg-blue-500 text-white px-4 py-1 rounded">Close</button>
          </>
        )}
      </Modal>
    </div>
  );
};

export default TransactionTable;
