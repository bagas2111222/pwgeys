import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Cabang() {
  const [semuacabang, setSemuacabang] = useState([]);
  const [bulanTahun, setBulanTahun] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const [editCityName, setEditCityName] = useState("");
  const [editProductId, setEditProductId] = useState('');


  const paginate = (pageNumber) => setCurrentPage(pageNumber);

    async function fetchCabangData() {
      try {
         Swal.fire({
          title: 'Loading',
          html: 'Sedang Mengambil data',
          allowOutsideClick: false,
          showConfirmButton: false, // Remove the "OK" button
          onBeforeOpen: () => {
            Swal.showLoading();
          }
        });
        const id = window.location.pathname.split("/").pop();
        const response = await axios.get(`http://localhost:8000/api/cabang-kota/byCabang/${id}`);
        const data = response.data[0].map((item) => ({
          id: item.id,
          cabang: item.nama_cabang,
          kota: item.cabang_besar.nama_kota,
          closing: item['last-closing'] || "N/A",
        }));
        setSemuacabang(data);
        Swal.close();
      } catch (error) {
        console.error("Error fetching data:", error);
        // Display error message using SweetAlert
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch data from API. Please try again later.',
        });
      }
    }

    useEffect(() => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');

      if (!token) {
          // Redirect ke halaman login jika token tidak tersedia
          navigate("/login");
      } else {
          if (role !== 'admin') {
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
          }
      }

      
      fetchCabangData();
    }, []);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(semuacabang.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const handleRowClick = (id) => {
    Swal.fire({
      title: 'Select Month and Year',
      html: `<input type="month" id="monthPicker" class="swal2-input">`,
      focusConfirm: false,
      preConfirm: () => {
        const monthPicker = document.getElementById('monthPicker');
        const selectedValue = monthPicker.value;
        const [year, month] = selectedValue.split('-');
        setSelectedDate({ year, month });
        navigate(`/PegawaiKota/${id}/${month}/${year}`);
      }
    });
  };
  const handleAddDataFromCSV = () => {
    const id = window.location.pathname.split("/").pop();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split('\n').slice(1); // skip header
        const token = localStorage.getItem('token');
        if (token) {
          for (let row of rows) {
            const cityName = row.trim();
            if (cityName) { // skip empty rows
              try {
                await axios.post('http://localhost:8000/api/cabang-kota/create', {
                  nama_cabang: cityName,
                  id_cabangBesar: id
                }, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                console.log('City added:', cityName);
              } catch (error) {
                console.error('Error adding city:', error);
              }
            }
          }
          fetchCabangData();
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };
  
  const handleAddCity = () => {
    const id = window.location.pathname.split("/").pop();
    Swal.fire({
      title: 'Tambah Cabang',
      input: 'text',
      inputLabel: 'Nama Cabang',
      inputPlaceholder: 'Masukkan nama Cabang',
      showCancelButton: true,
      confirmButtonText: 'Tambah',
      cancelButtonText: 'Batal',
      preConfirm: (cityName) => {
        const token = localStorage.getItem('token');
        if (token) {
          axios.post('http://localhost:8000/api/cabang-kota/create', {
            nama_cabang: cityName,
            id_cabangBesar: id
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          .then(response => {
            console.log('New city added:', response.data);
            fetchCabangData();
          })
          .catch(error => {
            console.error('Error adding new city:', error);
          });
        }
      }
    });
  };
  const handleEditCity = (productId, cityName) => {
    const id = window.location.pathname.split("/").pop();
    setEditCityName(cityName);
    setEditProductId(productId);
    Swal.fire({
      title: `Edit Cabang ${cityName}`,
      input: 'text',
      inputLabel: 'Nama Cabang',
      inputPlaceholder: 'Masukkan nama Cabang',
      showCancelButton: true,
      confirmButtonText: 'Edit',
      cancelButtonText: 'Batal',
      preConfirm: (cityName) => {
        const token = localStorage.getItem('token');
        if (token) {
          axios.put(`http://localhost:8000/api/cabang-kota/edit/${productId}`, {
            nama_cabang: cityName,
            id_cabangBesar: id
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          .then(response => {
            console.log('New city added:', response.data);
            fetchCabangData();
          })
          .catch(error => {
            console.error('Error adding new city:', error);
          });
        }
      }
    });
  };
  const copyLinkToClipboard = (id, cabang) => {
    const link = `http://localhost:5173/Pegawai/FormPegawai/${id}/${cabang}`;
    navigator.clipboard.writeText(link).then(() => {
      Swal.fire({
        title: 'Link Copied!',
        text: 'The link has been copied to your clipboard.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    }).catch((error) => {
      console.error("Error copying text: ", error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to copy the link.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
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
          axios.delete(`http://localhost:8000/api/cabang-kota/delete/${productId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(response => {
            console.log('New city added:', response.data);
            fetchCabangData();
          })
          .catch(error => {
            console.error('Error adding new city:', error);
          });
        }
      }
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-4/5 m-10 overflow-x-auto shadow-md sm:rounded-lg">
        <button 
          type="button" 
          className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-gray-10 rounded-lg border border-gray-100 hover:bg-gray-200 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          onClick={handleAddCity}
        >
          Tambah Cabang 
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline-block align-right ml-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
        <button 
        type="button" 
        className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-gray-10 rounded-lg border border-gray-100 hover:bg-gray-200 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
        onClick={handleAddDataFromCSV}
      >
        Tambah Data dari CSV/Excel 
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline-block align-right ml-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
        <br />
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                no
              </th>
              <th scope="col" className="px-6 py-3">
                Cabang
              </th>
              <th scope="col" className="px-6 py-3">
                Kota
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Hapus</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {semuacabang
              .slice(indexOfFirstItem, indexOfLastItem)
              .map((item, index) => (
                <tr
                  key={item.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  onClick={() => handleRowClick(item.id)}
                >
                  <td className="px-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {item.cabang}
                  </td>
                  <td className="px-6 py-4">{item.kota}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                    onClick={(e) => {
                      e.stopPropagation(); // Stop propagation to prevent navigating
                      handleEditCity(item.id, item.cabang);
                    }}
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Stop propagation to prevent navigating
                        handleDeleteCity(item.id, item.cabang);
                      }}
                      className="font-medium text-red-600 dark:text-red-500 hover:underline px-2 py-1"
                    >
                      hapus
                    </button>
                    <button
                      onClick={() => copyLinkToClipboard(item.id, item.cabang)}
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline px-2 py-1"
                    >
                      copy link form
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between w-4/5 sm:hidden">
        <a
          href="#"
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </a>
        <a
          href="#"
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => paginate(currentPage + 1)}
          disabled={indexOfLastItem >= semuacabang.length}
        >
          Next
        </a>
      </div>
      <div className="hidden sm:flex justify-between w-4/5">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span>{" "}
            to <span className="font-medium">{indexOfLastItem}</span> of{" "}
            <span className="font-medium">{semuacabang.length}</span> results
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            {pageNumbers.map((number) => (
              <a
                key={number}
                href="#"
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  number === currentPage
                    ? "bg-indigo-600 text-white"
                    : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => paginate(number)}
              >
                {number}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
