import { useState, useEffect } from "react";
import axios from "axios";
// import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function ReportPegawai() {
  const [semuacabang, setSemuacabang] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const navigate = useNavigate();

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

    async function fetchCabangData() {
      try {
        // Display loading popup using SweetAlert
        Swal.fire({
          title: 'Loading',
          html: 'Sedang Mengambil data',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          }
        });
        const token = localStorage.getItem('token');

        const response = await axios.get(`http://localhost:8000/api/laporan/userPegawai`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });        
        const data = response.data[0].map((item) => ({
          id: item.id,
          tgl_aktifitas: item.tgl_aktifitas,
          aktifitas: item.aktifitas,
          jenis_produk: item['jenis-produk'], // Change this to jenis_produk
          closing: item.closing === "0" ? "belum" : item.closing === "1" ? "sudah" : "N/A",
          ket_closing: item.ket_closing,
        }));
        setSemuacabang(data);

        // Close loading popup after data is fetched
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
    const navigate = useNavigate()

    useEffect(() => {
      const token = localStorage.getItem('token');
        if (!token) {
            // Redirect ke halaman login jika token tidak tersedia
            navigate("/login");
        }
    fetchCabangData();
  }, []);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(semuacabang.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

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
                tanggal aktifitas
              </th>
              <th scope="col" className="px-6 py-3">
                aktifitas
              </th>
              <th scope="col" className="px-6 py-3">
                jenis produk
              </th>
              <th scope="col" className="px-6 py-3">
                Closing
              </th>
              <th scope="col" className="px-6 py-3">
                Keterangan Closing
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
                // onClick={() => handleRowClick(item.id)} // Menggunakan onClick untuk menangani klik pada baris
              >
                <td className="px-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {indexOfFirstItem + index + 1}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {item.tgl_aktifitas}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {item.aktifitas}
                </td>
                <td className="px-6 py-4">{item.jenis_produk}</td>
                <td className="px-6 py-4">{item.closing}</td>
                <td className="px-6 py-4">{item.ket_closing}</td>
                <td className="px-6 py-4 text-right">
                <button
                    href={item.href}
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline px-2 py-1"
                  >
                    closing
                  </button>
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
