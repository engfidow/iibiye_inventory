import React, { useEffect, useState } from "react";
import MUIDatatable from "mui-datatables";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import axios from 'axios';
import { MdPostAdd, MdDelete, MdEdit } from "react-icons/md";
import Modal from 'react-modal';
import CircularProgress from '@mui/material/CircularProgress'; 
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import { confirmAlert } from 'react-confirm-alert'; 
import 'react-confirm-alert/src/react-confirm-alert.css'; 

function CategoriesTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); 
  const MuiCache = createCache({
    key: "mui-datatables",
    prepend: true
  });

  const [Categories, setCategories] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [btnUpdate, setBtnUpdate] = useState(false);
  const [btnSave, setBtnSave] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    Description: "",
    icon: null,
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    Description: "",
    icon: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://retailflash.up.railway.app/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRowClick = (rowData, rowMeta) => {
    const selectedRowIndex = rowMeta.dataIndex;
    const selectedCategory = Categories[selectedRowIndex];
    setSelectedCategory(selectedCategory);
    setFormData({
      name: selectedCategory.name,
      Description: selectedCategory.Description,
      icon: selectedCategory.icon,
    });
    setBtnUpdate(true);
    setBtnSave(false);
    setIsModalOpen(true);
  };

  const columns = [
    { 
      name: "icon", 
      label: "Icon", 
      options: { 
        customBodyRender: (value) => <img src={`http://localhost:5000/${value}`} alt="icon" style={{ width: '50px' }} /> 
      } 
    },
    { name: "name", label: "Category Name" },
    { name: "Description", label: "Description" },
    {
      name: "actions",
      label: "Actions",
      options: {
        customBodyRender: (value, tableMeta) => {
          const rowIndex = tableMeta.rowIndex;
          return (
            <div>
              <button 
                onClick={() => handleEdit(rowIndex)} 
                style={{ backgroundColor: 'green', color: 'white', marginRight: '5px', padding: '5px', borderRadius: '5px' }}
              >
                <MdEdit />
              </button>
              <button 
                onClick={() => confirmDelete(rowIndex)} 
                style={{ backgroundColor: 'red', color: 'white', padding: '5px', borderRadius: '5px' }}
              >
                <MdDelete />
              </button>
            </div>
          );
        }
      }
    }
  ];

  const options = {
    responsive: "vertical",
    tableBodyHeight: "400px",
    selectableRows: 'none',
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "" // Clear the error message for the field being edited
    }));
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!formData.name.match(/^[a-zA-Z\s]*$/)) {
      isValid = false;
      errors.name = "Category name can contain only letters and spaces.";
    }
    if (!formData.Description) {
      isValid = false;
      errors.Description = "Description cannot be null.";
    }
    if (!formData.icon) {
      isValid = false;
      errors.icon = "Image cannot be null.";
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (!validateForm()) {
      return;
    }

    const formDataToSubmit = new FormData();
    formDataToSubmit.append("name", formData.name);
    formDataToSubmit.append("Description", formData.Description);
    if (formData.icon) {
      formDataToSubmit.append("icon", formData.icon);
    }

    try {
      let response;
      if (btnSave) {
        response = await axios.post('https://retailflash.up.railway.app/api/categories', formDataToSubmit);
        toast.success("Category created successfully");
      } else {
        const updateUrl = `https://retailflash.up.railway.app/api/categories/${selectedCategory._id}`;
        response = await axios.put(updateUrl, formDataToSubmit);
        toast.success("Category updated successfully");
      }
      fetchData();
      resetFormData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error submitting category:", error);
      toast.error("An error occurred while submitting the category");
    }
  };

  const handleEdit = (index) => {
    const selectedCategory = Categories[index];
    setSelectedCategory(selectedCategory);
    setFormData({
      name: selectedCategory.name,
      Description: selectedCategory.Description,
      icon: selectedCategory.icon,
    });
    setBtnUpdate(true);
    setBtnSave(false);
    setIsModalOpen(true);
  };

  const confirmDelete = (index) => {
    confirmAlert({
      title: 'Confirm to delete',
      message: 'Are you sure to delete this category?',
      buttons: [
        {
          label: 'Yes',
          onClick: () => handleDelete(index)
        },
        {
          label: 'No',
        }
      ]
    });
  };

  const handleDelete = async (index) => {
    const selectedCategory = Categories[index];
    try {
      const deleteUrl = `https://retailflash.up.railway.app/api/categories/${selectedCategory._id}`;
      await axios.delete(deleteUrl);
      toast.success("Category deleted successfully");
      fetchData();
      resetFormData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("An error occurred while deleting the category");
    }
  };

  const resetFormData = () => {
    setFormData({
      name: "",
      Description: "",
      icon: null,
    });
    setFormErrors({
      name: "",
      Description: "",
      icon: ""
    });
  };

  const handleAddNewCategory = () => {
    setBtnSave(true);
    setBtnUpdate(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    resetFormData();
    setIsModalOpen(false);
  };

  return (
    <div className='e-container'>
      <ToastContainer />
      <Modal
        className="bg-white rounded mx-auto p-4 fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add New Category Modal"
        style={{ overlay: { zIndex: 51 }, content: { width: '400px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' } }}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-4">{btnSave ? "Add New Category" : "Update Category"}</h2>
          </div>
          <div className="mb-4">
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
              Category Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full border ${formErrors.name ? 'border-red-500' : 'border-blue-300'} rounded p-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="Description" className="block mb-2 text-sm font-medium text-gray-900">
              Description
            </label>
            <input
              type="text"
              name="Description"
              id="Description"
              value={formData.Description}
              onChange={handleInputChange}
              className={`w-full border ${formErrors.Description ? 'border-red-500' : 'border-blue-300'} rounded p-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {formErrors.Description && <p className="text-red-500 text-xs mt-1">{formErrors.Description}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="icon" className="block mb-2 text-sm font-medium text-gray-900">
              Icon
            </label>
            <input
              type="file"
              name="icon"
              id="icon"
              accept="image/*"
              onChange={handleInputChange}
              className={`w-full border ${formErrors.icon ? 'border-red-500' : 'border-blue-300'} rounded p-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {formErrors.icon && <p className="text-red-500 text-xs mt-1">{formErrors.icon}</p>}
            {formData.icon && (
              <div className="mt-2">
                <img
                  src={typeof formData.icon === 'string' ? `http://localhost:5000/${formData.icon}` : URL.createObjectURL(formData.icon)}
                  alt="Icon preview"
                  className="w-20 h-20 object-cover"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end">
            {btnUpdate && (
              <>
                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={handleFormSubmit}
                >
                  Update
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white px-4 py-2 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  onClick={() => confirmDelete(Categories.findIndex(category => category._id === selectedCategory._id))}
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
              type="button"
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
              className="flex gap-3 focus:outline-none text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5 mb-2"
              onClick={handleAddNewCategory}
            >
              <MdPostAdd className="text-lg" /> Add New Category
            </button>
            {loading ? (
              <div className="flex justify-center">
                <CircularProgress />
              </div>
            ) : (
              <MUIDatatable
                title={"Categories List"}
                data={Categories}
                columns={columns}
                options={options}
              />
            )}
          </ThemeProvider>
        </CacheProvider>
      </div>
    </div>
  );
}

export default CategoriesTable;
