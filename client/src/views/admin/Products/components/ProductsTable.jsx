import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { MdPostAdd, MdDelete, MdEdit } from 'react-icons/md';
import MUIDataTable from 'mui-datatables';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CircularProgress from '@mui/material/CircularProgress'; // For loading spinner
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

// Modal accessibility setup
Modal.setAppElement('#root');

function ProductsTable() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for shimmer effect
  const [submitLoading, setSubmitLoading] = useState(false); // Loading state for form submission
  const [validationMessages, setValidationMessages] = useState({});
  const [modalFormData, setModalFormData] = useState({
    uid: '',
    name: '',
    price: '',
    sellingPrice: '',
    status: '',
    category: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [btnUpdate, setBtnUpdate] = useState(false);
  const [btnSave, setBtnSave] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filterOption, setFilterOption] = useState('all');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const closeModal = () => {
    resetFormData();
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      setImagePreview(URL.createObjectURL(file));
      setModalFormData(prevState => ({ ...prevState, image: file }));
    } else {
      setModalFormData(prevState => ({ ...prevState, [name]: value }));
    }
    setValidationMessages(prevMessages => ({ ...prevMessages, [name]: '' }));
  };

  const validateForm = () => {
    let messages = {};
    let isValid = true;

    if (!modalFormData.uid.trim()) {
      isValid = false;
      messages.uid = 'UID is required';
    }
    if (!modalFormData.name.trim()) {
      isValid = false;
      messages.name = 'Name is required';
    }
    if (!modalFormData.price || isNaN(modalFormData.price)) {
      isValid = false;
      messages.price = 'Valid price is required';
    }
    if (!modalFormData.sellingPrice || isNaN(modalFormData.sellingPrice) || Number(modalFormData.sellingPrice) < Number(modalFormData.price)) {
      isValid = false;
      messages.sellingPrice = 'Valid selling price is required and must be greater than or equal to price';
    }
    if (!modalFormData.status) {
      isValid = false;
      messages.status = 'Status is required';
    }
    if (!modalFormData.category) {
      isValid = false;
      messages.category = 'Category is required';
    }
    if (!modalFormData.image) {
      isValid = false;
      messages.image = 'Image is required';
    }

    setValidationMessages(messages);
    return isValid;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    if (!validateForm()) {
      setSubmitLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('uid', modalFormData.uid);
    formData.append('name', modalFormData.name);
    formData.append('price', modalFormData.price);
    formData.append('sellingPrice', modalFormData.sellingPrice);
    formData.append('status', modalFormData.status);
    formData.append('category', modalFormData.category);
    formData.append('image', modalFormData.image);

    try {
      if (btnSave) {
        await axios.post('http://localhost:5000/api/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Product added successfully');
      } else {
        const updateUrl = `http://localhost:5000/api/products/${selectedProduct._id}`;
        await axios.put(updateUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Product updated successfully');
      }
      fetchProducts();
      resetFormData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to submit product:', error);
      toast.error('Failed to submit product');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (index) => {
    const selectedProduct = products[index];
    setSelectedProduct(selectedProduct);
    setModalFormData({
      uid: selectedProduct.uid,
      name: selectedProduct.name,
      price: selectedProduct.price,
      sellingPrice: selectedProduct.sellingPrice,
      status: selectedProduct.status,
      category: selectedProduct.category._id,
      image: selectedProduct.image,
    });
    setImagePreview(`http://localhost:5000/${selectedProduct.image}`);
    setBtnUpdate(true);
    setBtnSave(false);
    setIsModalOpen(true);
  };

  const confirmDelete = (index) => {
    confirmAlert({
      title: 'Confirm to delete',
      message: 'Are you sure to delete this product?',
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
    const selectedProduct = products[index];
    try {
      const deleteUrl = `http://localhost:5000/api/products/${selectedProduct._id}`;
      await axios.delete(deleteUrl);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    }
  };

  const resetFormData = () => {
    setModalFormData({
      uid: '',
      name: '',
      price: '',
      sellingPrice: '',
      status: '',
      category: '',
      image: null,
    });
    setValidationMessages({});
    setImagePreview(null);
    setBtnUpdate(false);
    setBtnSave(true);
  };

  const handleAddNewProduct = () => {
    if (categories.length === 0) {
      toast.error('Please register a category before adding a product');
      return;
    }
    setIsModalOpen(true);
  };

  const customModalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '30rem',
      zIndex: 1000,
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 999,
    },
  };

  const MuiCache = createCache({
    key: 'mui-datatables',
    prepend: true,
  });

  const columns = [
    {
      name: 'image',
      label: 'Image',
      options: {
        customBodyRender: (value) => {
          return <img src={`http://localhost:5000/${value}`} alt="Product" style={{ height: '50px' }} />;
        },
      },
    },
    { name: 'uid', label: 'UID' },
    { name: 'name', label: 'Name' },
    { name: 'price', label: 'Price' },
    { name: 'sellingPrice', label: 'Selling Price' },
    { 
      name: 'status', 
      label: 'Status',
      options: {
        customBodyRender: (value) => (
          <span style={{ color: value === 'active' ? 'green' : 'red' }}>{value}</span>
        )
      }
    },
    {
      name: 'actions',
      label: 'Actions',
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

  // const data = products.map((product) => [
  //   product.image, product.uid, product.name, product.price, product.sellingPrice, product.status
  // ]);
  const filteredProducts = products.filter(product => {
    if (filterOption === 'all') {
      return true;
    } else {
      return product.status === filterOption;
    }
  });

  const data = filteredProducts.map((product) => [
    product.image, product.uid, product.name, product.price, product.sellingPrice, product.status
  ]);


  const options = {
    responsive: "vertical",
    tableBodyHeight: "400px",
    selectableRows: 'none',
  };

  return (
    <div>
      <ToastContainer />
      {/* Combo box */}
      <select
         value={filterOption}
         onChange={(e) => setFilterOption(e.target.value)}
        className="p-3 my-2 rounded-md border-solid border-blue-300 border-[1px] w-full"
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      
      {/* Add new product button */}
      <button
        onClick={handleAddNewProduct}
        className="flex gap-3 focus:outline-none text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700"
      >
        <MdPostAdd /> Add New Product
      </button>
      
      {/* Table */}
      <CacheProvider value={MuiCache}>
        <ThemeProvider theme={createTheme()}>
          {loading ? (
            <div className="flex justify-center">
              <CircularProgress />
            </div>
          ) : (
            <MUIDataTable title={'Product List'} data={data} columns={columns} options={options} />
          )}
        </ThemeProvider>
      </CacheProvider>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={customModalStyles}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>{btnSave ? 'Add New Product' : 'Update Product'}</h2>
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mx-auto h-40 w-40 rounded-sm object-cover mb-4"
          />
        )}
        <form onSubmit={handleFormSubmit} >
          <div className='grid grid-cols-2 gap-3'>
            {/* Form inputs */}
            <input type="text" name="uid" placeholder="UID" onChange={handleInputChange} value={modalFormData.uid} required className={`p-3 my-2 rounded-md border-solid ${validationMessages.uid ? 'border-red-500' : 'border-blue-300'} border-[1px] w-full`} />
            {validationMessages.uid && <p className="text-red-500 text-xs mt-1">{validationMessages.uid}</p>}
            <input type="text" name="name" placeholder="Name" onChange={handleInputChange} value={modalFormData.name} required className={`p-3 my-2 rounded-md border-solid ${validationMessages.name ? 'border-red-500' : 'border-blue-300'} border-[1px] w-full`} />
            {validationMessages.name && <p className="text-red-500 text-xs mt-1">{validationMessages.name}</p>}
            <input type="number" name="price" placeholder="Price" onChange={handleInputChange} value={modalFormData.price} required className={`p-3 my-2 rounded-md border-solid ${validationMessages.price ? 'border-red-500' : 'border-blue-300'} border-[1px] w-full`} />
            {validationMessages.price && <p className="text-red-500 text-xs mt-1">{validationMessages.price}</p>}
            <input type="number" name="sellingPrice" placeholder="Selling Price" onChange={handleInputChange} value={modalFormData.sellingPrice} required className={`p-3 my-2 rounded-md border-solid ${validationMessages.sellingPrice ? 'border-red-500' : 'border-blue-300'} border-[1px] w-full`} />
            {validationMessages.sellingPrice && <p className="text-red-500 text-xs mt-1">{validationMessages.sellingPrice}</p>}
            <select name="status" onChange={handleInputChange} value={modalFormData.status} required className={`p-3 my-2 rounded-md border-solid ${validationMessages.status ? 'border-red-500' : 'border-blue-300'} border-[1px] w-full`}>
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {validationMessages.status && <p className="text-red-500 text-xs mt-1">{validationMessages.status}</p>}
            <select name="category" onChange={handleInputChange} value={modalFormData.category} required className={`p-3 my-2 rounded-md border-solid ${validationMessages.category ? 'border-red-500' : 'border-blue-300'} border-[1px] w-full`}>
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
            {validationMessages.category && <p className="text-red-500 text-xs mt-1">{validationMessages.category}</p>}
            <input type="file" name="image" onChange={handleInputChange} className={`p-3 my-2 rounded-md border-solid ${validationMessages.image ? 'border-red-500' : 'border-blue-300'} border-[1px] w-full`} />
            {validationMessages.image && <p className="text-red-500 text-xs mt-1">{validationMessages.image}</p>}
          </div>
          
          {/* Form buttons */}
          <div className='grid grid-cols-2 gap-3'>
            <button type="submit" className='bg-green-600 p-3 border-none rounded-md cursor-pointer mt-3 text-white'>
              {submitLoading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
            </button>
            <button type="button" onClick={closeModal} className='bg-gray-700 p-3 border-none rounded-md cursor-pointer mt-3 text-white'>Close</button>
          </div>
          
        </form>
      </Modal>
    </div>
  );
}

export default ProductsTable;
