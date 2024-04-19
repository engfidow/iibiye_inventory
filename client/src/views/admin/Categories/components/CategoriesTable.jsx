import {React, useEffect, useState }  from "react"
import MUIDatatable from "mui-datatables"
import { ThemeProvider } from "@mui/material/styles"
import { createTheme } from "@mui/material/styles"
import { CacheProvider } from "@emotion/react"
import createCache    from "@emotion/cache"
import axios from 'axios'
import { MdPostAdd } from "react-icons/md"
import Modal from 'react-modal';

function CategoriesTable() {
    const formattedDate = new Date().toLocaleDateString();
    const [isModalOpen, setIsModalOpen] = useState(false);
const MuiCache = createCache({
  key:"mui-datatables",
  prepend:true
})

const[Categories ,setCategories] = useState([]);


const fetchData = async () => {
    try {
      
      const CategoriesData = await axios.get('http://localhost:5000/api/Categories/get');
      const reslty = CategoriesData.data;
      setCategories(reslty);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };
  useEffect(() => {
    // Call fetchData only when the component mounts
    fetchData();
  }, []);
//   

const[responsive ,setresponsive] = useState("vertical");
const[tableBodyHeight , settableBodyHeight] = useState("400px");
const[tableBodyMaxHeight , settableBodyMaxHeight] = useState("");
const[addBtn,setBtn] = useState(true);
const[searchBtn , setsearch] = useState(true);
const[downloadBtn , setdownload] = useState(true);
const[printBtn , setprint] = useState(true);
const[veiColumnsBtn , setveiwColumns] = useState(true);
const[filterBtn, setfilter]= useState(true);

const [selectedCategories, setSelectedCategories] = useState(null);

const handleRowClick = (rowData, rowMeta) => {
  
  const selectedRowIndex = rowMeta.dataIndex;
  const selectedExpense = Categories[selectedRowIndex];
  setSelectedCategories(selectedExpense);
  setBtnUpdate(true);
  setBtnSave(false);
  setIsModalOpen(true);
};

const columns =[
  
  "Categorie Name",
  "Date",
  

];

const options = {
  onRowClick: handleRowClick,
  add: addBtn,
  search:searchBtn,
  download : downloadBtn,
  print : printBtn,
  veiColumns :  veiColumnsBtn,
  filter : filterBtn,
  responsive,
  tableBodyHeight,
  tableBodyMaxHeight,
//  onTableChange:(action ,state)=>{
//   console.log(action);
//   console.log(state);
//  }
}



// ];
const [formSubmitted, setFormSubmitted] = useState(false);

    // State for form data
    const [formData, setFormData] = useState({
       
        Categories: "",
        date: "",
        
    });
    const resetFormData = () => {
      setFormData({
        Categories: "",
        date: "",
      });
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    useEffect(() => {
      if (selectedCategories) {
        setFormData({
          
          Categories: selectedCategories.Description,
          date: selectedCategories.date,
        });
      }
    }, [selectedCategories]);
    const handleUpdate = async (e) => {
      e.preventDefault();
      setFormSubmitted(true);
    
      if (formData.Categories === "" || formattedDate === "") {
        // Handle empty fields
        return;
      }
    
      try {
        // Replace ':id' in the URL with the actual ID of the expense
        const updateUrl = `http://localhost:5000/api/Categories/${formData.id}`;
    
        // Make a PUT request to update the expense by ID
        const response = await axios.put(updateUrl, {
          
          Categories: formData.Categories,
          date: formData.date,
        });
    
        alert("Updated This Categories:", response.data);
        fetchData();
        resetFormData();
        setIsModalOpen(false);
        // Handle successful update, redirect user, etc.
      } catch (error) {
        console.error("Error updating Categories:", error.response.data);
        // Handle update error (e.g., display error message)
      }
    };
    // delete expence by id 
    const handleDelete = async (e) => {
      e.preventDefault();
      setFormSubmitted(true);
    
      if (formData.id === "") {
        // Handle empty fields
        return;
      }
    
      try {
        // Replace ':id' in the URL with the actual ID of the expense
        const deleteUrl = `http://localhost:5000/api/Categories/delete${formData.id}`;
    
        // Make a DELETE request to delete the expense by ID
        const response = await axios.delete(deleteUrl);
    
        alert("Deleted This Categories:", response.data);
        fetchData();
        resetFormData();
        setIsModalOpen(false);
        // Handle successful deletion, redirect user, etc.
      } catch (error) {
        console.error("Error deleting Categories:", error.response.data);
        // Handle deletion error (e.g., display error message)
      }
    };
    
    
const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
   
    if (formData.Categories === "" || formattedDate === "") {
      alert("Please fill in all the fields before submitting!");
      return;
    }

    
   
    try {
     
        // Make a POST request to your backend endpoint for user registration
        const response = await axios.post('http://localhost:5000/api/Categories', {
          
            Categories: formData.Categories,
            date: formData.date
           
        });

        alert("Registered This Categories :", response.data);
        fetchData();
        resetFormData();
        setIsModalOpen(false);
        // Handle successful registration, redirect user, etc.
    } catch (error) {
        console.error("Error registering Categories:", error.response.data);
        // Handle registration error (e.g., display error message)
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
  const [btnupdate, setBtnUpdate] = useState(false);
  const [btnsave, setBtnSave] = useState(true);
  return (
    <div className='e-container'>
         {/* Modal Component */}
      
      <Modal
  className="bg-white  rounded  mx-auto p-4 fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
  isOpen={isModalOpen}
  onRequestClose={closeModal}
  contentLabel="Add New Transaction Modal"
  style={{ overlay: { zIndex: 51 }, content: { width: '400px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' } }}
>    <form onSubmit={handleFormSubmit}>
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-4">Add New Categories</h2>
        
        
        
      </div>
      <div className="mb-4">
        <label htmlFor="field2" className="block mb-2 text-sm font-medium text-gray-900 ">
         Categories Name
        </label>
        <input
          type="text"
          name="Categories"
          id="field2"
          value={formData.Categories}
          onChange={handleInputChange}
          pattern="[a-zA-Z]*"
          title="Please enter characters (a-z) only."
          className="w-full border border-blue-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-500 dark:placeholder-gray-400 "
        />
        {formSubmitted && !/^[a-zA-Z]*$/.test(formData.Categories) && (
              <label className="text-red-700 text-xs">Please enter valid characters (a-z and A-Z) only.</label>
            )}
      </div>
     
      <div className="mb-4">
        <label htmlFor="field3" className="block mb-2 text-sm font-medium text-gray-900 ">
          Date
        </label>
        <input
          type="date"
          name="date"
          id="field3"
          value={formData.date}
          
          onChange={handleInputChange}
          className="w-full border border-blue-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 dark:border-black-500 dark:placeholder-gray-400 "
        />
        {formSubmitted && !formData.date && (
              <label className="text-red-700 text-xs">Please choose a date.</label>
            )}
      </div>
      
      <div className="flex justify-end">
      {btnupdate && <button
          
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={handleUpdate}
        >
          Update
        </button>}
        {btnupdate && <button
          
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={handleDelete}
        >
          Delete
        </button>}
      
        {btnsave && <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          // onClick={handleSave}
        >
          Save
        </button>}
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
              className="flex gap-3 focus:outline-none text-white bg-red-700 hover:bg-red-800   font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 "
              onClick={handleAddNewTransaction}
            >
              <MdPostAdd className="text-lg" /> Add New Categories
            </button>
            <MUIDatatable
              title={"Categories List"}
              data={Categories.map((Categories) => [Categories.CategoriesID, Categories.Categories, Categories.DateAdded])}
              columns={columns}
              options={options}
              
            />
          </ThemeProvider>
        </CacheProvider>
         
        </div>
        </div>
  )
}

export default CategoriesTable