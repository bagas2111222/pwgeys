import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Lazy load SweetAlert2
const Swal = React.lazy(() => import('sweetalert2'));

export default function FormPegawai() {
  const [data, setData] = useState([]);
  const [wilayah, setWilayah] = useState('');
  const [cabang, setCabang] = useState([]);
  const [selectedCabang, setSelectedCabang] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/api/cabang-kota/all')
      .then(response => response.json())
      .then(data => {
        setData(data[0]);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        import('sweetalert2').then(Swal => {
          Swal.default.fire('Error', 'Failed to fetch data', 'error');
        });
      });
  }, []);

  const handleWilayahChange = useCallback((event) => {
    const selectedWilayah = event.target.value;
    setWilayah(selectedWilayah);

    const filteredCabang = data.filter(item => item.cabang_besar.nama_kota === selectedWilayah);
    setCabang(filteredCabang);
  }, [data]);

  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if (selectedCabang) {
      const selectedCabangData = cabang.find(item => item.id.toString() === selectedCabang);
      if (selectedCabangData) {
        navigate(`/Pegawai/FormPegawai/${selectedCabang}/${selectedCabangData.nama_cabang}`);
      } else {
        import('sweetalert2').then(Swal => {
          Swal.default.fire('Error', 'Invalid cabang selected', 'error');
        });
      }
    } else {
      import('sweetalert2').then(Swal => {
        Swal.default.fire('Error', 'Please select a cabang', 'error');
      });
    }
  }, [cabang, navigate, selectedCabang]);

  const uniqueKota = useMemo(() => {
    return Array.from(new Set(data.map(item => item.cabang_besar.nama_kota)));
  }, [data]);

  return (
    <form className="px-6 py-10" onSubmit={handleSubmit}>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-2xl font-semibold leading-7 text-gray-900">Form tambah data laporan</h2><br />
        </div>
        <label htmlFor="wilayah" className="block text-sm font-medium leading-6 text-gray-900">
          Pilih Wilayah
        </label>
        <div className="mt-2">
          <select
            id="wilayah"
            name="wilayah"
            autoComplete="wilayah"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
            value={wilayah}
            onChange={handleWilayahChange}
          >
            <option value="">Pilih Wilayah</option>
            {uniqueKota.map((kota, index) => (
              <option key={index} value={kota}>{kota}</option>
            ))}
          </select>
        </div>
        <label htmlFor="cabang" className="block text-sm font-medium leading-6 text-gray-900">
          Pilih Cabang
        </label>
        <div className="mt-2">
          <select
            id="cabang"
            name="cabang"
            autoComplete="cabang"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
            value={selectedCabang}
            onChange={e => setSelectedCabang(e.target.value)}
          >
            <option value="">Pilih Cabang</option>
            {cabang.map((item, index) => (
              <option key={index} value={item.id}>{item.nama_cabang}</option>
            ))}
          </select>
        </div>
        <div className="mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Next
          </button>
        </div>
      </div>
    </form>
  );
}
