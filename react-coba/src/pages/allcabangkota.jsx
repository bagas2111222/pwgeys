import { useState, useEffect } from "react";
import axios from "axios";
// import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function allCabang() {
  const [semuacabang, setSemuacabang] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

    async function fetchCabangData() {
      try {
        // Extracting the id from the current URL path
        const response = await axios.get(`http://localhost:8000/api/cabang-kota/all`);
        // Adjusting the structure of the received data to match the existing structure
        const data = response.data[0].map((item) => ({
          id: item.id,
          cabang: item.nama_cabang,
          kota: item.cabang_besar.nama_kota,
          closing: item['last-closing'] || "N/A",
          // href: `/pegawai-kota/${item.id}`,
        }));
        setSemuacabang(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    const navigate = useNavigate();

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

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-4/5 m-10 overflow-x-auto shadow-md sm:rounded-lg">
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
                onClick={() => handleRowClick(item.id)} // Menggunakan onClick untuk menangani klik pada baris
              >
                <td className="px-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {indexOfFirstItem + index + 1}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {item.cabang}
                </td>
                <td className="px-6 py-4">{item.kota}</td>
                <td className="px-6 py-4 text-right">
                  <a
                    href={item.href}
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline px-2 py-1"
                  >
                    Edit
                  </a>
                  <a
                    href={item.href}
                    className="font-medium text-red-600 dark:text-red-500 hover:underline px-2 py-1"
                  >
                    hapus
                  </a>
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
