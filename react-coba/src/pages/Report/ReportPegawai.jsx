import { useState, useEffect } from "react";
import axios from "axios";
// import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";


export default function ReportPegawai() {
  const [semuacabang, setSemuacabang] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const navigate = useNavigate();

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  async function exportToExcel() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Pegawai");
    const headerRow = worksheet.addRow([`REPORT LAPORAN: ${semuacabang[0]?.name}`]); // Using the name from the first item
    headerRow.font = { bold: true };

    // Menambahkan header
    worksheet.addRow([
      "No",
      "Tanggal Aktifitas",
      "Keterangan",
      "Jenis Produk",
      "Bintang",
      "Closing",
      "Keterangan Closing",
      "Timestamp",
    ]);
  
    // Menambahkan data dari tabel
    semuacabang.forEach((item, index) => {
      worksheet.addRow([
        index + 1,
        item.tgl_aktifitas,
        item.aktifitas,
        item.jenis_produk,
        item.bintang,
        item.closing,
        item.ket_closing,
        item.create,
      ]);
    });
  
    // Menghasilkan file Excel
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, "laporan_pegawai.xlsx");
  }

    async function fetchCabangData() {
      try {
        const params = window.location.pathname.split("/").slice(-3); // Extracting the last three elements
        const id = params[0];
        const bulan = params[1];
        const tahun = params[2];
        // Display loading popup using SweetAlert
        Swal.fire({
          title: 'Loading',
          html: 'Sedang Mengambil data',
          allowOutsideClick: false,
          onBeforeOpen: () => {
            Swal.showLoading();
          }
        });

        const response = await axios.get(`http://localhost:8000/api/laporan/byusermonth/${id}/${bulan}/${tahun}`);
        const data = response.data[0].map((item) => {
          const createdDate = new Date(item.created_at);
          const activityDate = new Date(item.tgl_aktifitas);

          const formatDate = (date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-based month
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
          };        
          return {
            id: item.id,
            name: item.user.name,
            tgl_aktifitas: formatDate(activityDate),
            aktifitas: item.aktifitas,
            jenis_produk: item['jenis-produk'], // Change this to jenis_produk
            closing: item.closing === "0" ? "belum" : item.closing === "1" ? "sudah" : "N/A",
            bintang: item.bintang,
            ket_closing: item.ket_closing,
            create: formatDate(createdDate), // Format the date to day-month-year
          };
        });
        setSemuacabang(data);

        // Close loading popup after data is fetched
        Swal.close();
      } catch (error) {
        console.error("Error fetching data:", error);
        // Display error message using SweetAlert
        Swal.fire({
          icon: 'error',
          title: 'Kosong',
          text: 'tidak ada data laporan di user ini',
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
              swal("Akses Ditolak", "Anda tidak memiliki akses!", "error").then(() => {
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

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-4/5 m-10 overflow-x-auto shadow-md sm:rounded-lg">
      <button 
        type="button" 
        className="py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-gray-10 rounded-lg border border-gray-100 hover:bg-gray-200 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
        onClick={exportToExcel}
        >
        export to Excel
      </button>
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
                keterangan
              </th>
              <th scope="col" className="px-6 py-3">
                jenis produk
              </th>
              <th scope="col" className="px-6 py-3">
                bintang
              </th>
              <th scope="col" className="px-6 py-3">
                closing
              </th>
              <th scope="col" className="px-6 py-3">
                keterangan closing
              </th>
              <th scope="col" className="px-6 py-3">
                timestamp
              </th>
              {/* <th scope="col" className="px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Hapus</span>
              </th> */}
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
                <td className="px-6 py-4">{item.bintang}</td>
                <td className="px-6 py-4">{item.closing}</td>
                <td className="px-6 py-4">{item.ket_closing}</td>
                <td className="px-6 py-4">{item.create}</td>

                {/* <td className="px-6 py-4 text-right">
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
                </td> */}
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
