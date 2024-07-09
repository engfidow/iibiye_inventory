import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { MdPostAdd, MdDelete, MdEdit, MdDownload } from 'react-icons/md';
import MUIDataTable from 'mui-datatables';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CircularProgress from '@mui/material/CircularProgress';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import ProgressBar from '@ramonak/react-progress-bar';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import NoImageProduct from "../../../../assets/noimage.png";
import logo from "../../../../assets/logo.png";

// Modal accessibility setup
Modal.setAppElement('#root');

function ProductsTable() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://iibiye.up.railway.app/api/products');
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
      const response = await axios.get('https://iibiye.up.railway.app/api/categories');
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
        await axios.post('https://iibiye.up.railway.app/api/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Product added successfully');
      } else {
        const updateUrl = `https://iibiye.up.railway.app/api/products/${selectedProduct._id}`;
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
    setImagePreview(`https://iibiye.up.railway.app/${selectedProduct.image}`);
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
      const deleteUrl = `https://iibiye.up.railway.app/api/products/${selectedProduct._id}`;
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

  const formatDateTime = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const columns = [
    {
      name: 'image',
      label: 'Image',
      options: {
        customBodyRender: (value) => {
          return <img 
          src={value ? `https://iibiye.up.railway.app/${value}` : NoImageProduct} 
          alt="Product" 
          style={{ height: '50px' }} 
        />
        
        },
      },
    },
    { name: 'uid', label: 'UID' },
    { name: 'name', label: 'Name' },
    { name: 'price', label: 'Price' },
    { name: 'sellingPrice', label: 'Selling Price' },
    { 
      name: 'category.name', 
      label: 'Category Name' 
    },
    { 
      name: 'createdAt', 
      label: 'Date', 
      options: {
        customBodyRender: (value) => formatDateTime(value)
      } 
    },
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

  const filteredProducts = products.filter(product => {
    if (filterOption === 'all') {
      return true;
    } else {
      return product.status === filterOption;
    }
  });

  const data = filteredProducts.map((product) => [
    product.image, product.uid, product.name, product.price, product.sellingPrice, product.category.name, product.createdAt, product.status
  ]);

  const options = {
    responsive: "vertical",
    tableBodyHeight: "400px",
    selectableRows: 'none',
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        try {
          setIsUploading(true);
          const response = await axios.post('https://iibiye.up.railway.app/api/products/bulk', jsonData, {
            headers: {
              'Content-Type': 'application/json',
            },
            onUploadProgress: (progressEvent) => {
              const { loaded, total } = progressEvent;
              let percent = Math.floor((loaded * 100) / total);
              setUploadProgress(percent);
            },
          });

          setIsUploading(false);
          setUploadProgress(0);

          toast.success('Products imported successfully');
          fetchProducts(); // Refresh the product table
        } catch (error) {
          setIsUploading(false);
          setUploadProgress(0);

          if (error.response && error.response.data && error.response.data.error) {
            toast.error(error.response.data.error);
          } else {
            console.error('Failed to import products:', error);
            toast.error('Failed to import products');
          }
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast.error('Please upload a valid .xlsx file');
    }
  };

  const downloadData = async (format) => {
    if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(filteredProducts.map(product => ({
        UID: product.uid,
        Name: product.name,
        Price: product.price,
        'Selling Price': product.sellingPrice,
        Status: product.status,
        'Category Name': product.category.name,
        Date: formatDateTime(product.createdAt),
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(data, 'products.xlsx');
    } else if (format === 'pdf') {
      const doc = new jsPDF();
  
      // Add logo
      const img = new Image();
      img.src = logo;
      img.onload = () => {
        const logoWidth = 20; // Adjust logo width
        const logoHeight = 20; // Adjust logo height
        const logoX = 10; // Adjust logo X position
        const logoY = 10; // Adjust logo Y position
  
        doc.addImage(img, 'PNG', logoX, logoY, logoWidth, logoHeight);
        doc.setFontSize(20);
        doc.text('Iibiye', 60, 20);
        doc.setFontSize(14);
        doc.text('Products Report', 60, 30);
  
        const columns = ['UID', 'Name', 'Price', 'Selling Price', 'Status', 'Category Name', 'Date'];
        const rows = filteredProducts.map(product => [
          product.uid,
          product.name,
          product.price,
          product.sellingPrice,
          product.status,
          product.category.name,
          formatDateTime(product.createdAt),
        ]);
  
        doc.autoTable({
          startY: 40,
          head: [columns],
          body: rows,
        });
  
        // Add footer
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(10);
        doc.text('© 2024 Iibiye', 10, pageHeight - 10);
        doc.text('Contact: +252 612910628 | Iibiye@info.com', 10, pageHeight - 5);
  
        doc.save('products.pdf');
      };
    } 
  };
  


  return (
    <div>
      <ToastContainer />
      <select
        value={filterOption}
        onChange={(e) => setFilterOption(e.target.value)}
        className="p-3 my-2 rounded-md border-solid border-blue-300 border-[1px] w-full"
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-3 3xl:grid-cols-6">
       
        <button
          onClick={handleAddNewProduct}
          className="flex gap-3 focus:outline-none text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700"
        >
          <MdPostAdd /> Add New Product
        </button>
        
        
       
          <label className="flex gap-3 focus:outline-none text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 cursor-pointer">
            <MdPostAdd /> Import Products
            <input type="file" accept=".xlsx" onChange={handleFileUpload} className="hidden" />
          </label>          
          {isUploading && (
            <>
              <ProgressBar completed={uploadProgress} />
              <CircularProgress className="mt-3" />
            </>
          )}
      
      
        <button
            onClick={() => downloadData('xlsx')}
            className="flex gap-3 focus:outline-none text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <MdDownload /> Download XLSX
          </button>
          <button
            onClick={() => downloadData('pdf')}
            className="flex gap-3 focus:outline-none text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <MdDownload /> Download PDF
          </button>
       
          
          
       
      </div>
      
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
