import React, { useEffect, useState } from "react";
import MUIDatatable from "mui-datatables";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import axios from "axios";
import Modal from "react-modal";
import CircularProgress from "@mui/material/CircularProgress";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../../../../assets/logo.png";

function TransactionTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const MuiCache = createCache({ key: "mui-datatables", prepend: true });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("https://iibiye-inventory.onrender.com/api/transactions/get");
        setTransactions(res.data);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (val) => `$${parseFloat(val).toFixed(2)}`;
  const getProfitColor = (profit) => (profit >= 0 ? "green" : "red");

  const calculateRevenue = (products) =>
    products.reduce((acc, p) => acc + (p.productUid.sellingPrice - p.productUid.price), 0);

  const filteredTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || txDate >= start) && (!end || txDate <= end);
  });

  const columns = [
    { name: "No", options: { customBodyRenderLite: (i) => i + 1 } },
    "Transaction ID",
    "User Name",
    "Product Names",
    "Product Prices",
    "Selling Prices",
    {
      name: "Total Price",
      options: {
        customBodyRender: (value) => formatCurrency(value)
      }
    },
    {
      name: "Revenue",
      options: {
        customBodyRender: (value) => (
          <span style={{ color: getProfitColor(value) }}>{formatCurrency(value)}</span>
        )
      }
    },
    "Date",
  ];

  const handleRowClick = (_, meta) => {
    const tx = filteredTransactions[meta.dataIndex];
    setSelectedTransaction(tx);
    setIsModalOpen(true);
  };

  const formatDateTime = (d) =>
    new Date(d).toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

  return (
    <div className="e-container">
      <div className="flex gap-4 mb-4">
        <div>
          <label className="mr-2">Start Date:</label>
          <input type="date" className="border p-2 rounded" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <label className="mr-2">End Date:</label>
          <input type="date" className="border p-2 rounded" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <CircularProgress />
        </div>
      ) : (
        <>
          <Modal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            className="bg-white rounded-lg mx-auto p-6 fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] max-h-[90%] overflow-auto shadow-lg"
            style={{ overlay: { backgroundColor: "rgba(0,0,0,0.75)", zIndex: 999 } }}
          >
            {selectedTransaction && (
              <div>
                <h2 className="text-xl font-bold mb-4">Transaction Details</h2>
                <p><b>Transaction ID:</b> {selectedTransaction._id}</p>
                <p><b>User:</b> {selectedTransaction.userCustomerId?.name}</p>
                <p><b>Payment Phone:</b> {selectedTransaction.paymentPhone}</p>
                <p><b>Total Price:</b> {formatCurrency(selectedTransaction.totalPrice)}</p>
                <p><b>Revenue:</b> <span style={{ color: getProfitColor(calculateRevenue(selectedTransaction.productsList)) }}>{formatCurrency(calculateRevenue(selectedTransaction.productsList))}</span></p>
                <p><b>Date:</b> {formatDateTime(selectedTransaction.createdAt)}</p>

                <h3 className="mt-4 mb-2 font-semibold">Products:</h3>
                {selectedTransaction.productsList.map((p, idx) => (
                  <div key={idx} className="mb-2 border p-2 rounded bg-gray-100">
                    <p><b>Name:</b> {p.productUid.name}</p>
                    <p><b>Price:</b> {formatCurrency(p.productUid.price)}</p>
                    <p><b>Selling Price:</b> {formatCurrency(p.productUid.sellingPrice)}</p>
                  </div>
                ))}

                <button
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
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
                title="Transaction List"
                columns={columns}
                data={filteredTransactions.map((tx, i) => [
                  i + 1,
                  tx._id,
                  tx.userCustomerId?.name,
                  tx.productsList.map(p => p.productUid.name).join(", "),
                  tx.productsList.map(p => formatCurrency(p.productUid.price)).join(", "),
                  tx.productsList.map(p => formatCurrency(p.productUid.sellingPrice)).join(", "),
                  tx.totalPrice,
                  calculateRevenue(tx.productsList),
                  formatDateTime(tx.createdAt)
                ])}
                options={{ onRowClick: handleRowClick }}
              />
            </ThemeProvider>
          </CacheProvider>
        </>
      )}
    </div>
  );
}

export default TransactionTable;
