import React, { useEffect, useState } from "react";
import MUIDatatable from "mui-datatables";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import axios from "axios";
import { MdPostAdd } from "react-icons/md";
import Modal from "react-modal";

function ExpenseTable() {
  const formattedDate = new Date().toLocaleDateString();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const MuiCache = createCache({
    key: "mui-datatables",
    prepend: true,
  });

  const [expense, setExpense] = useState([]);

  const fetchData = async () => {
    try {
      
      const xogta = await axios.get('http://localhost:5000/api/expences/get');
      const reslty = xogta.data;
      setExpense(reslty);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };
 
 useEffect(()=>{
  fetchData();
 },[])
  


  const [responsive, setResponsive] = useState("vertical");
  const [tableBodyHeight, setTableBodyHeight] = useState("400px");
  const [tableBodyMaxHeight, setTableBodyMaxHeight] = useState("");
  const [addBtn, setAddBtn] = useState(true);
  const [searchBtn, setSearchBtn] = useState(true);
  const [downloadBtn, setDownloadBtn] = useState(true);
  const [printBtn, setPrintBtn] = useState(true);
  const [viewColumnsBtn, setViewColumnsBtn] = useState(true);
  const [filterBtn, setFilterBtn] = useState(true);

  const [selectedExpense, setSelectedExpense] = useState(null);

  const handleRowClick = (rowData, rowMeta) => {
    const selectedRowIndex = rowMeta.dataIndex;
    const selectedExpense = expense[selectedRowIndex];
    setSelectedExpense(selectedExpense);
    setBtnUpdate(true);
    setBtnSave(false);
    setIsModalOpen(true);
  };

  const columns = ["ID", "Amount", "Descriptions", "Date"];

  const options = {
    onRowClick: handleRowClick,
    add: addBtn,
    search: searchBtn,
    download: downloadBtn,
    print: printBtn,
    viewColumns: viewColumnsBtn,
    filter: filterBtn,
    responsive,
    tableBodyHeight,
    tableBodyMaxHeight,
  };

  const [formSubmitted, setFormSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    amount: "",
    description: "",
    date: "",
  });

  const resetFormData = () => {
    setFormData({
      id: "",
      amount: "",
      description: "",
      date: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  useEffect(() => {
    if (selectedExpense) {
      setFormData({
        id: selectedExpense.ExpenseID,
        amount: selectedExpense.Amount,
        description: selectedExpense.Description,
        date: selectedExpense.DateSpent,
      });
    }
  }, [selectedExpense]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (formData.amount === "" || formData.description === "" || formData.date === "") {
      alert("Please fill in all the fields before submitting!");
      return;
    }

    try {
      const updateUrl = `http://localhost:5000/api/expenses/${formData.id}`;

      const response = await axios.put(updateUrl, {
        amount: formData.amount,
        description: formData.description,
        date: formData.date,
      });

      alert("Updated This Transaction:", response.data);
      fetchData();
      resetFormData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating transaction:", error.response.data);
    }
  };







  const handleDelete = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (formData.id === "") {
      return;
    }

    try {
      const deleteUrl = `http://localhost:5000/api/expenses/delete${formData.id}`;

      const response = await axios.delete(deleteUrl);

      alert("Deleted This Transaction:", response.data);
      fetchData();
      resetFormData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting transaction:", error.response.data);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (formData.amount === "" || formData.description === "" || formData.date === "") {
      alert("Please fill in all the fields before submitting!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/expenses", {
        amount: formData.amount,
        description: formData.description,
        date: formData.date,
      });

      alert("Registered This Transaction :", response.data);
      fetchData();
      resetFormData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error registering user:", error.response.data);
    }
  };

  const handleAddNewTransaction = () => {
    setBtnSave(true);
    setBtnUpdate(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    resetFormData();
    setIsModalOpen(false);
  };

  const [btnUpdate, setBtnUpdate] = useState(false);
  const [btnSave, setBtnSave] = useState(true);

  return (
    <div className="e-container">
      {/* Modal Component */}
      <Modal
        className="bg-white rounded mx-auto p-4 fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add New Transaction Modal"
        style={{ overlay: { zIndex: 51 }, content: { width: '400px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' } }}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-4">Add New Transaction</h2>

            <label htmlFor="field1" className="block mb-2 text-sm font-medium text-gray-900">
              Amount
            </label>
            <input
              pattern="[0-9]*"
              type="text"
              id="field1"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full border border-blue-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-500 dark:placeholder-gray-400"
            />
            {formSubmitted && isNaN(formData.amount) && (
              <label className="text-red-700 text-xs">Please enter a valid number.</label>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="field2" className="block mb-2 text-sm font-medium text-gray-900">
              Description
            </label>
            <input
              type="text"
              name="description"
              id="field2"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border border-blue-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-500 dark:placeholder-gray-400"
              pattern="[a-zA-Z]*"
              title="Please enter characters (a-z) only."
            />
            {formSubmitted && !/^[a-zA-Z]*$/.test(formData.description) && (
              <label className="text-red-700 text-xs">Please enter valid characters (a-z and A-Z) only.</label>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="field3" className="block mb-2 text-sm font-medium text-gray-900">
              Date
            </label>
            <input
              type="date"
              name="date"
              id="field3"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full border border-blue-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 dark:border-black-500 dark:placeholder-gray-400"
            />
            {formSubmitted && !formData.date && (
              <label className="text-red-700 text-xs">Please choose a date.</label>
            )}
          </div>

          <div className="flex justify-end">
            {btnUpdate && (
              <>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={handleUpdate}
                >
                  Update
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={handleDelete}
                >
                  Delete
                </button>
              </>
            )}

            {btnSave && (
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save
              </button>
            )}

            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </form>
      </Modal>

      <div>
        <CacheProvider value={MuiCache}>
          <ThemeProvider theme={createTheme()}>
            <button
              type="button"
              className="flex gap-3 focus:outline-none text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700"
              onClick={handleAddNewTransaction}
            >
              <MdPostAdd className="text-lg" /> Add New Transaction
            </button>
            <MUIDatatable
              title={"Expense report"}
              data={expense.map((Expense) => [Expense.ExpenseID, Expense.Amount, Expense.Description, Expense.DateSpent])}
              columns={columns}
              options={options}
            />
          </ThemeProvider>
        </CacheProvider>
      </div>
    </div>
  );
}

export default ExpenseTable;
