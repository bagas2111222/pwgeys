import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

async function fetchProducts(token) {
  try {
    const response = await axios.get('http://localhost:8000/api/cabang_besar', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data; // Assuming the response contains an array of products
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error; // Re-throw the error to be caught by the caller
  }
}

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [newCityName, setNewCityName] = useState('');
  const [editCityName, setEditCityName] = useState('');
  const [editProductId, setEditProductId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
      // Redirect ke halaman login jika token tidak tersedia
      navigate("/login");
    } else if (role !== 'admin') {
      // Menampilkan popup jika peran bukan admin
      Swal.fire({
        title: 'Akses Ditolak',
        text: 'Anda tidak memiliki akses!',
        icon: 'error',
        confirmButtonText: 'OK'
      }).then(() => {
        // Redirect ke halaman Pegawai jika peran bukan admin
        navigate("/Pegawai");
      });
    } else {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProducts(token)
        .then(data => {
          setProducts(data);
        })
        .catch(error => {
          if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            navigate('/login');
          }
        });
    }
  }, []);

  const handleEditCity = (productId, cityName) => {
    setEditCityName(cityName);
    setEditProductId(productId);
    Swal.fire({
      title: 'Edit Kota',
      input: 'text',
      inputValue: cityName,
      inputLabel: 'Nama Kota',
      inputPlaceholder: 'Masukkan nama kota',
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      preConfirm: (newCityName) => {
        const token = localStorage.getItem('token');
        if (token) {
          axios.put(`http://localhost:8000/api/cabang_besar/edit/${productId}`,
            { nama_kota: newCityName },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
          .then(response => {
            console.log('City updated:', response.data);
            fetchProducts(token).then(data => {
              setProducts(data);
            });
          })
          .catch(error => {
            console.error('Error updating city:', error);
          });
        }
      }
    });
  };

  const handleAddCity = () => {
    Swal.fire({
      title: 'Tambah Kota',
      input: 'text',
      inputLabel: 'Nama Kota',
      inputPlaceholder: 'Masukkan nama kota',
      showCancelButton: true,
      confirmButtonText: 'Tambah',
      cancelButtonText: 'Batal',
      preConfirm: (cityName) => {
        const token = localStorage.getItem('token');
        if (token) {
          axios.post('http://localhost:8000/api/cabang_besar/create',
            { nama_kota: cityName },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
          .then(response => {
            console.log('New city added:', response.data);
            fetchProducts(token).then(data => {
              setProducts(data);
            });
          })
          .catch(error => {
            console.error('Error adding new city:', error);
          });
        }
      }
    });
  };

  const handleDeleteCity = (productId, cityName) => {
    Swal.fire({
      title: 'Konfirmasi',
      text: `Apakah Anda yakin ingin menghapus kota ${cityName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        if (token) {
          axios.delete(`http://localhost:8000/api/cabang_besar/delete/${productId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(response => {
            console.log('City deleted:', response.data);
            fetchProducts(token).then(data => {
              setProducts(data);
            });
          })
          .catch(error => {
            console.error('Error deleting city:', error);
          });
        }
      }
    });
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <p className="mb-8 text-3xl font-bold">Cabang</p>
        <button 
          type="button" 
          className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-gray-10 rounded-lg border border-gray-100 hover:bg-gray-200 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          onClick={handleAddCity}
        >
          Tambah Kota 
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline-block align-right ml-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
        <div className="grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group">
              <div className="relative mt-8 border border-gray-100 rounded-lg grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 w-100 h-100 cursor-pointer" onClick={() => navigate(`/CabangBesar/${product.id}`)}>
                <Link to={`/CabangBesar/${product.id}`} className="absolute inset-0"></Link>
                <h3 className="mt-4 text-sm text-l text-gray-900">{product.nama_kota}</h3>
                <div className="absolute bottom-2 right-2 space-x-2">
                  <button 
                    className="px-2 py-2 text-sm text-gray-900  hover:text-blue-400" 
                    onClick={(e) => {
                      e.stopPropagation(); // Stop propagation to prevent navigating
                      handleEditCity(product.id, product.nama_kota);
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    className="px-2 py-2 text-sm text-gray-900  hover:text-red-500" 
                    onClick={(e) => {
                      e.stopPropagation(); // Stop propagation to prevent navigating
                      handleDeleteCity(product.id, product.nama_kota);
                    }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
