import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { MdPostAdd } from 'react-icons/md';
import MUIDataTable from 'mui-datatables';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// Modal accessibility setup
Modal.setAppElement('#root');

function ProductsTable() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFormData, setModalFormData] = useState({
    uid: '',
    name: '',
    selling_price: '',
    quantity: '',
    status: '',
    
    Category: '',
    
    
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);
  const closeModal = () => {
   
    setIsModalOpen(false);

  };
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
  
    if (files && files.length > 0) {
      const file = files[0];
      setImagePreview(URL.createObjectURL(file));
      // Set the file within modalFormData for form submission
      setModalFormData(prevState => ({ ...prevState, image: file }));
    } else {
      // Update other form data without overwriting the entire state
      setModalFormData(prevState => ({ ...prevState, [name]: value }));
    }
  };
  

  

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(modalFormData).forEach((key) => {
      formData.append(key, modalFormData[key]);
    });

    try {
      await axios.post('http://localhost:5000/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Product added successfully');
      setIsModalOpen(false);
      setModalFormData({ uid: '', name: '', selling_price: '', quantity: '', status: '', image: null }); // Reset form
    } catch (error) {
      console.error('Failed to submit product:', error);
    }
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
          return <img src={value} alt="Product" style={{ height: '50px' }} />;
        },
      },
    },
    'uid', 'name', 'selling_price', 'quantity', 'status'
  ];

  const data = products.map((product) => [
    product.image, product.uid, product.name, product.selling_price, product.quantity, product.status
  ]);

  const options = {
    filterType: 'checkbox',
  };

  return (
    <div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex gap-3 focus:outline-none text-white bg-red-700 hover:bg-red-800   font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 "
      >
        <MdPostAdd /> Add New Product
      </button>
      <CacheProvider value={MuiCache}>
        <ThemeProvider theme={createTheme()}>
          <MUIDataTable title={'Product List'} data={data} columns={columns} options={options} />
        </ThemeProvider>
      </CacheProvider>

      <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} style={customModalStyles}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Add New Product</h2>
        {/* Preview image */}
        {imagePreview && (
            <img
              src={imagePreview}
              alt="Preview"
              className="mx-auto h-40 w-40 rounded-sm object-cover mb-4"
            />
            
          )}
        <form onSubmit={handleFormSubmit} className='grid grid-cols-2 gap-3'>
        
          <input type="text" name="uid" placeholder="UID" onChange={handleInputChange} value={modalFormData.uid} required className='p-3 my-2 rounded-md border-solid border-blue-300 border-[1px] w-full' />
          <input type="text" name="name" placeholder="Name" onChange={handleInputChange} value={modalFormData.name} required className='p-3 my-2 rounded-md border-solid border-blue-300 border-[1px] w-full' />
          <input type="number" name="price" placeholder="Price" onChange={handleInputChange} value={modalFormData.price} required className='p-3 my-2 rounded-md border-solid border-blue-300 border-[1px] w-full' />
          <input type="number" name="selling_price" placeholder="Selling Price" onChange={handleInputChange} value={modalFormData.selling_price} required className='p-3 my-2 rounded-md border-solid border-blue-300  border-[1px] w-full' />
          
          <select name="status" onChange={handleInputChange} value={modalFormData.status} required className='p-3 my-2 rounded-md border-solid border-blue-300  border-[1px] w-full'>
            <option value="">Select Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select name="Category" onChange={handleInputChange} value={modalFormData.Category} required className='p-3 my-2 rounded-md border-solid border-blue-300  border-[1px] w-full'>
            <option value="">Select Category</option>
            <option value="active">Electronics</option>
            <option value="clothes">Clothes</option>
            <option value="food">Food</option>
          </select>
          <input type="number" name="quantity" placeholder="Quantity" onChange={handleInputChange} value={modalFormData.quantity} required className='p-3 my-2 rounded-md border-solid border-blue-300  border-[1px] w-full' />
          <input type="file" name="image" onChange={handleInputChange} className='p-3 my-2 rounded-md border-solid border-blue-300 border-[1px] w-full' />
          
          <button type="submit" className='bg-green-600 p-3 border-none rounded-md cursor-pointer mt-3 text-white'>Submit</button>
          <button  onClick={closeModal} className='bg-gray-700 p-3 border-none rounded-md cursor-pointer mt-3 text-white'>Close</button>
        </form>
        <h1 className='p-3 my-2 rounded-md border-solid border-blue-300 w-full'></h1>
      </Modal>
    </div>
  );
}





export default ProductsTable;
