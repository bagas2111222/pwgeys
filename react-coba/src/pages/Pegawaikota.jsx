import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

export default function Pegawaikota() {
  const [semuacabang, setSemuacabang] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const navigate = useNavigate(); // Move useNavigate outside the component to avoid potential issues

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

    async function fetchCabangData() {
      try {
        // Extracting the parameters from the current URL path
        const params = window.location.pathname.split("/").slice(-3); // Extracting the last three elements
        const id = params[0];
        const bulan = params[1];
        const tahun = params[2];
        const response = await axios.get(`http://localhost:8000/api/pegawai/coba/${id}/${bulan}/${tahun}`);
        // Adjusting the structure of the received data to match the existing structure
        const data = response.data[0].map((item) => ({
          id: item.pegawai.user.id,
          nama: item.pegawai.user.name,
          cabang: item.pegawai.cabang_kota.nama_cabang,
          kota: item.pegawai.cabang_kota.cabang_besar.nama_kota,
          bintang:item.total_bintang,
          closing:item.total_closing,
          laporan:item.total_laporan,
          href: "",
        }));
        setSemuacabang(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    useEffect(() => {
    fetchCabangData();
  }, []);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(semuacabang.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }
  const handleRowClick = (id) => {
    const params = window.location.pathname.split("/").slice(-3);
    const bulan = params[1];
    const tahun = params[2];
    navigate(`/ReportPegawai/${id}/${bulan}/${tahun}`);
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
            const name = row.trim();
            if (name) { // skip empty rows
              try {
                // Ambil id_CabangKota dari URL
                const idCabangKota = window.location.pathname.split("/")[2];
                await axios.post('http://localhost:8000/api/registerUser', {
                  name: name,
                  role: 'pegawai', // Pegawai
                  jabatan: 'pegawai', // set to 'pegawai' 
                  id_CabangKota: parseInt(idCabangKota) // set to idCabangKota
                }, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                console.log('City added:', name);
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
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-4/5 m-10 overflow-x-auto shadow-md sm:rounded-lg">
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
                Cabang
              </th>
              <th scope="col" className="px-6 py-3">
                Kota
              </th>
              <th scope="col" className="px-6 py-3">
                bintang
              </th>
              <th scope="col" className="px-6 py-3">
                closing
              </th>
              <th scope="col" className="px-6 py-3">
                total laporan
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
                onClick={() => handleRowClick(item.id)} // Add onClick event handler
              >
                <td className="px-2 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {indexOfFirstItem + index + 1}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {item.nama}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {item.cabang}
                </td>
                <td className="px-6 py-4">{item.kota}</td>
                <td className="px-6 py-4">{item.bintang}</td>
                <td className="px-6 py-4">{item.closing}</td>
                <td className="px-6 py-4">{item.laporan}</td>

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
