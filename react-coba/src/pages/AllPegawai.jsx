import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Cabang() {
  const [semuacabang, setSemuacabang] = useState([]);
  const [semuacabang_data, setSemuacabang_data] = useState([]);
  const [cabangKotaOptions, setCabangKotaOptions] = useState([]);
  const [bulanTahun, setBulanTahun] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const [editUserData, setEditUserData] = useState(null);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  async function fetchCabangData() {
    try {
      Swal.fire({
        title: 'Loading',
        html: 'Sedang Mengambil data',
        allowOutsideClick: false,
        showConfirmButton: false,
        onBeforeOpen: () => {
          Swal.showLoading();
        }
      });
      const response = await axios.get(`http://localhost:8000/api/pegawai/allFull`);
      const data = response.data[0].map((item) => ({
        id: item.id,
        nama: item.name,
        email: item.email,
        role: item.role,
        jabatan: item.pegawai?.jabatan || '-',
        cabang: item.pegawai?.cabang_kota?.nama_cabang || '-',
        kota: item.pegawai?.cabang_kota?.cabang_besar?.nama_kota || '-',
      }));
      setSemuacabang(data);
      Swal.close();
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch data from API. Please try again later.',
      });
    }
  }

  async function fetchCabang_koData() {
    try {
      const response = await axios.get(`http://localhost:8000/api/cabang-kota/all`);
      const data = response.data[0].map((item) => ({
        value: item.id,
        text: item.nama_cabang,
      }));
      setCabangKotaOptions(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
      navigate("/login");
    } else {
      if (role !== 'admin') {
        Swal.fire({
          title: 'Akses Ditolak',
          text: 'Anda tidak memiliki akses!',
          icon: 'error',
          confirmButtonText: 'OK'
        }).then(() => {
          navigate("/Pegawai");
        });
      }
    }

    fetchCabang_koData();
    fetchCabangData();
  }, []);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(semuacabang.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState('');

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
        navigate(`/ReportPegawai/${id}/${month}/${year}`);
      }
    });
  };

  const handleAddCity = () => {
    Swal.fire({
      title: 'Tambah Pengguna',
      html: `
        <label for="swal-input2" style="margin-right: 10px;">Role</label>
        <select id="swal-input2" class="swal2-input" onchange="handleRoleChange()">
          <option value="admin">Admin</option>
          <option value="pegawai">Pegawai</option>
        </select>
        <input id="swal-input1" class="swal2-input" placeholder="Name">
        <input id="swal-input3" class="swal2-input small-placeholder" placeholder="username (jika pegawai tidak perlu diisi)">
        <input id="swal-input4" class="swal2-input small-placeholder" type="password" placeholder="Password (jika pegawai tidak perlu diisi)">
        <input id="swal-input5" class="swal2-input small-placeholder" placeholder="Jabatan (jika admin tidak perlu diisi)">
        <label for="swal-input6" style="margin-right: 10px;">Kantor Cabang</label>
        <select id="swal-input6" class="swal2-input">
          ${cabangKotaOptions.map(option => `<option value="${option.value}">${option.text}</option>`).join('')}
        </select>
        <p id="role-message" style="color: red; display: none;">Admin</p>`,
      showCancelButton: true,
      confirmButtonText: 'Tambah',
      cancelButtonText: 'Batal',
      preConfirm: () => {
        const name = document.getElementById('swal-input1').value;
        const role = document.getElementById('swal-input2').value;
        const email = document.getElementById('swal-input3').value;
        const password = document.getElementById('swal-input4').value;
        const jabatan = document.getElementById('swal-input5').value;
        const idCabangKota = document.getElementById('swal-input6').value;
  
        const token = localStorage.getItem('token');
        if (token) {
          return axios.post('http://localhost:8000/api/registerUser', {
            name: name,
            role: role,
            email: email,
            password: password,
            jabatan: role === 'admin' ? 1 : jabatan, // set to 1 if admin
            id_CabangKota: role === 'admin' ? 1 : idCabangKota // set to 1 if admin
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          .then(response => {
            console.log('New user added:', response.data);
            fetchCabangData();
            Swal.fire('Sukses', 'Pengguna baru berhasil ditambahkan!', 'success');
          })
          .catch(error => {
            console.error('Error adding new user:', error);
            Swal.fire('Gagal', 'Terjadi kesalahan saat menambahkan pengguna.', 'error');
          });
        }
      },
      didOpen: () => {
        const handleRoleChange = () => {
          const role = document.getElementById('swal-input2').value;
          const jabatanInput = document.getElementById('swal-input5');
          const emailInput = document.getElementById('swal-input3');
          const passwordInput = document.getElementById('swal-input4');
          const idCabangKotaSelect = document.getElementById('swal-input6');
          const roleMessage = document.getElementById('role-message');
  
          if (role === 'admin') {
            jabatanInput.disabled = true;
            idCabangKotaSelect.disabled = true;
            roleMessage.style.display = 'block';
          } else {
            emailInput.disabled = true;
            passwordInput.disabled = true;
            jabatanInput.disabled = false;
            idCabangKotaSelect.disabled = false;
            roleMessage.style.display = 'none';
          }
        };
  
        // Add the change event listener
        document.getElementById('swal-input2').addEventListener('change', handleRoleChange);
        // Initial call to set the correct state
        handleRoleChange();
      }
    });
  };
  

  const handleEditUser = async (userData) => {
    try {
        const response = await axios.get(`http://127.0.0.1:8000/api/pegawai/byid/${userData.id}`);
        const user = response.data;

        // Opsi pilihan untuk peran
        const roleOptions = [
            { value: 'admin', text: 'Admin' },
            { value: 'pegawai', text: 'Pegawai' }
        ];

        Swal.fire({
            title: 'Edit Pengguna',
            html: `
                <input id="swal-edit-input1" class="swal2-input" value="${user.name || ''}" placeholder="Name">
                <input id="swal-edit-input3" class="swal2-input" value="${user.email || ''}" placeholder="Email">
                <input id="swal-edit-input4" class="swal2-input" type="password" placeholder="New Password">
                <input id="swal-edit-input5" class="swal2-input" value="${user.pegawai?.jabatan || ''}" placeholder="Jabatan">
                <label for="swal-edit-input6" style="margin-right: 10px;">Kantor Cabang</label>
                <select id="swal-edit-input6" class="swal2-input">
                ${user.pegawai ? cabangKotaOptions.map(option => `<option value="${option.value}" ${option.text === user.pegawai.cabang_kota.nama_cabang ? 'selected' : ''}>${option.text}</option>`).join('') : ''}
                </select>
                <label for="swal-edit-input7" style="margin-right: 10px;">Role</label>
                <select id="swal-edit-input7" class="swal2-input">
                    ${roleOptions.map(option => `<option value="${option.value}" ${option.value === user.role ? 'selected' : ''}>${option.text}</option>`).join('')}
                </select>`,
            showCancelButton: true,
            confirmButtonText: 'Edit',
            cancelButtonText: 'Batal',
            preConfirm: () => {
                const name = document.getElementById('swal-edit-input1').value;
                const email = document.getElementById('swal-edit-input3').value;
                const password = document.getElementById('swal-edit-input4').value;
                const jabatan = document.getElementById('swal-edit-input5').value;
                const idCabangKota = document.getElementById('swal-edit-input6').value;
                const role = document.getElementById('swal-edit-input7').value;

                const token = localStorage.getItem('token');
                if (token) {
                    const payload = {
                        name: name,
                        email: email,
                        password: password || '', // Menggunakan password jika diisi, jika tidak, gunakan string kosong
                        role: role,
                        jabatan: role === 'admin' ? 'admin' : jabatan,
                        id_CabangKota: role === 'admin' ? 1 : idCabangKota
                    };

                    return axios.put(`http://127.0.0.1:8000/api/usersedit/${userData.id}`, payload, {
                    })
                    .then(response => {
                        console.log('User data updated:', response.data);
                        fetchCabangData(); // Pastikan fungsi ini tersedia
                        Swal.fire('Sukses', 'Data pengguna berhasil diupdate!', 'success');
                    })
                    .catch(error => {
                        console.error('Error updating user data:', error);
                        Swal.fire('Gagal', 'Terjadi kesalahan saat mengupdate data pengguna.', 'error');
                    });
                }
            }
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch user data from API. Please try again later.',
        });
    }
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
          axios.delete(`http://localhost:8000/api/pegawai/delete/${productId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          .then(response => {
            console.log('City deleted:', response.data);
            fetchCabangData();
            Swal.fire('Sukses', 'Cabang berhasil dihapus!', 'success');
          })
          .catch(error => {
            console.error('Error deleting city:', error);
            Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus cabang.', 'error');
          });
        }
      }
    });
  };

  return(
    <div className="flex flex-col items-center">
      <div className="relative w-4/5 m-10 overflow-x-auto shadow-md sm:rounded-lg">
        <button 
          type="button" 
          className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-gray-10 rounded-lg border border-gray-100 hover:bg-gray-200 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          onClick={handleAddCity}
        >
          Tambah pegawai 
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
                nama
              </th>
              <th scope="col" className="px-6 py-3">
                username
              </th>
              <th scope="col" className="px-6 py-3">
                role
              </th>
              <th scope="col" className="px-6 py-3">
                cabang
              </th>
              <th scope="col" className="px-6 py-3">
                kota
              </th>
              <th scope="col" className="px-6 py-3">
                jabatan
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
                    {item.nama}
                  </td>
                  <td className="px-6 py-4">{item.email}</td>
                  <td className="px-6 py-4">{item.role}</td>
                  <td className="px-6 py-4">{item.cabang}</td>
                  <td className="px-6 py-4">{item.kota}</td>
                  <td className="px-6 py-4">{item.jabatan}</td>

                  <td className="px-6 py-4 text-right">
                    <button
                    onClick={(e) => {
                      e.stopPropagation(); // Stop propagation to prevent navigating
                      handleEditUser(item);
                    }}
                      className="font-medium text-blue-600 dark:text-blue-500 hover:underline px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Stop propagation to prevent navigating
                        handleDeleteCity(item.id,item.nama);
                      }}
                      className="font-medium text-red-600 dark:text-red-500 hover:underline px-2 py-1"
                    >
                      hapus
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
