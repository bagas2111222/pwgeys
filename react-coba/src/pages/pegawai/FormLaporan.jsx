import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useParams, useNavigate } from 'react-router-dom';

export default function FormPegawai() {
  const [formData, setFormData] = useState({
    tgl_aktifitas: '',
    aktifitas: '',
    'jenis-produk': '',
    closing: false,
    id_users: '',
    ket_closing: '', // New state for ket_closing
  });
  const { id, cabang } = useParams(); // Extracting 'id' and 'cabang' from the URL
  const navigate = useNavigate(); // Hook to navigate programmatically

  const [pegawai, setPegawai] = useState([]);

  useEffect(() => {
    const fetchPegawai = async () => {
      Swal.fire({
        title: 'Loading',
        text: 'Fetching data...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await fetch(`http://localhost:8000/api/pegawai/bycabangkota/${id}`);
        
        if (response.status === 404) {
          throw new Error('Data not found');
        }

        const result = await response.json();
        setPegawai(result[0]);
        Swal.close();
      } catch (error) {
        console.error('Error fetching pegawai:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message === 'Data not found' ? 'Data tidak tersedia!' : 'Failed to fetch data!',
        });
      }
    };

    fetchPegawai();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      id_users: formData.id_users,
      tgl_aktifitas: formData.tgl_aktifitas,
      aktifitas: formData.aktifitas,
      jenis_produk: formData['jenis-produk'],
      closing: formData.closing,
      ket_closing: formData.closing ? formData.ket_closing : '', // Include ket_closing if closing is true
    };

    try {
      const response = await fetch('http://localhost:8000/api/laporan/createlaporan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Success:', result);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Data has been successfully submitted!',
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to submit data!',
      });
    }
  };

  return (
    <form className="px-6 py-10" onSubmit={handleSubmit}>
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-2xl font-semibold leading-7 text-gray-900">Form tambah data laporan</h2><br />
          <div className="sm:col-span-3">
              <label htmlFor="id_users" className="block text-sm font-medium leading-6 text-gray-900">
                Nama Pegawai
              </label>
              <div className="mt-2">
                <select
                  id="id_users"
                  name="id_users"
                  autoComplete="id_users"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  value={formData.id_users}
                  onChange={handleChange}
                >
                  <option value="">Pilih Pegawai</option>
                  {pegawai.map((p) => (
                    <option key={p.user.id} value={p.id_users}>
                      {p.user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="tgl_aktifitas" className="block text-sm font-medium leading-6 text-gray-900">
                Tanggal Aktivitas
              </label>
              <div className="mt-2">
                <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                  <input
                    type="date"
                    name="tgl_aktifitas"
                    id="tgl_aktifitas"
                    autoComplete="tgl_aktifitas"
                    className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                    value={formData.tgl_aktifitas}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="jenis-produk" className="block text-sm font-medium leading-6 text-gray-900">
                Jenis Aktivitas
              </label>
              <div className="mt-2">
                <select
                  id="jenis-produk"
                  name="jenis-produk"
                  autoComplete="jenis-produk"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  value={formData['jenis-produk']}
                  onChange={handleChange}
                >
                  <option value="">jenis aktivitas</option>
                  <option value="Kunjungan (Visit)">Kunjungan (Visit)</option>
                  <option value="Telepon/WA blast">Telepon/WA blast</option>
                  <option value="Update Status/ Promosi di Social Media">Update Status/ Promosi di Social Media</option>
                  <option value="Open Booth">Open Booth</option>
                  <option value="Presentasi/sosialisasi">Presentasi/sosialisasi</option>
                  <option value="lain lain">lain lain</option>
                </select>
              </div>
            </div>

            <div className="col-span-full">
              <label htmlFor="aktifitas" className="block text-sm font-medium leading-6 text-gray-900">
                Keterangan
              </label>
              <div className="mt-2">
                <textarea
                  id="aktifitas"
                  name="aktifitas"
                  rows={3}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  value={formData.aktifitas}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Closing</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600"></p>

          <div className="mt-10 space-y-10">
            <fieldset>
              <legend className="text-sm font-semibold leading-6 text-gray-900">jika belum closing abaikan ini</legend>
              <div className="mt-6 space-y-6">
                <div className="relative flex gap-x-3">
                  <div className="flex h-6 items-center">
                    <input
                      id="closing"
                      name="closing"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      checked={formData.closing}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="text-sm leading-6">
                    <label htmlFor="closing" className="font-medium text-gray-900">
                      Sudah closing
                    </label>
                  </div>
                </div>
                {formData.closing && (
                  <div className="col-span-full">
                    <label htmlFor="ket_closing" className="block text-sm font-medium leading-6 text-gray-900">
                      Keterangan Closing
                    </label>
                    <div className="mt-2">
                      <textarea
                        id="ket_closing"
                        name="ket_closing"
                        rows={3}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={formData.ket_closing}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}
              </div>
            </fieldset>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button type="button" className="text-sm font-semibold leading-6 text-gray-900">
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Save
        </button>
      </div>
    </form>
  );
}
