import { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

const LaporanForm = () => {
  const [formData, setFormData] = useState({
    periode: "",
    kota: "",
    cabang: "",
    tipe_laporan: "",
  });
  const [showSummary, setShowSummary] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [filteredSummaryData, setFilteredSummaryData] = useState([]);
  const [filteredDetailData, setFilteredDetailData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [apiData, setApiData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/report/all")
      .then((response) => response.json())
      .then((data) => setApiData(data))
      .catch((error) => console.error("Error fetching data:", error));
    // Fetch data from API
    fetch("http://localhost:8000/api/pegawai/cobasaja")
      .then((response) => response.json())
      .then((data) => {
        // Transform the data as needed
        const transformedData = data
          .map((item) => {
            const pegawai = item.pegawai;
            const nama = pegawai.data.user.name;
            const cabang = pegawai.data.cabang_kota.nama_cabang;
            const kota = pegawai.data.cabang_kota.cabang_besar.nama_kota;

            // Iterate over all periods in the response
            const periods = Object.keys(pegawai.periode);
            const periodData = periods.map((period) => {
              return {
                nama: nama,
                cabang: cabang,
                kota: kota,
                periode: period,
                closing: pegawai.periode[period].presentase_closing,
                totalLaporan: pegawai.periode[period].total_laporan,
                totalClosing: pegawai.periode[period].total_closing,
                totalBintang: pegawai.periode[period].total_bintang,
              };
            });
            return periodData;
          })
          .flat(); // Flatten the array of arrays

        setTableData(transformedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.tipe_laporan === "summary") {
      const filteredData = tableData.filter(
        (item) =>
          item.periode === formData.periode &&
          item.kota === formData.kota &&
          item.cabang === formData.cabang
      );
      setFilteredSummaryData(filteredData);
      setShowSummary(true);
      setShowDetail(false);
    } else if (formData.tipe_laporan === "detail") {
      const filteredData = detailData.filter(
        (item) =>
          item.tanggalAktivitas.startsWith(formData.periode) &&
          item.kota === formData.kota &&
          item.cabang === formData.cabang
      );
      setFilteredDetailData(filteredData);
      setShowDetail(true);
      setShowSummary(false);
    } else {
      setShowSummary(false);
      setShowDetail(false);
    }
  };

  // Data untuk tabel detail
  const detailData = apiData.map((item) => ({
    namaPegawai: item.user.name,
    cabang: item.pegawai.cabang_kota.nama_cabang,
    kota: item.pegawai.cabang_kota.cabang_besar.nama_kota,
    tanggalAktivitas: item.tgl_aktifitas,
    aktivitas: item.aktifitas,
    jenisProduk: item["jenis-produk"],
    bintang: item.bintang,
    ket_closing: item.ket_closing,
    closing: item.closing === "1" ? "sudah" : "belum",
  }));

  const generateSummaryPDFContent = (data) => {
    let content = "";
    data.forEach((row) => {
      content += `Nama: ${row.nama}, Cabang: ${row.cabang}, Kota: ${row.kota}, Closing: ${row.closing}%, Total Laporan: ${row.totalLaporan}, Total Closing: ${row.totalClosing}\n`;
    });
    return content;
  };

  const generateDetailPDFContent = (data) => {
    let content = "";
    data.forEach((row) => {
      content += ` Nama Pegawai: ${row.namaPegawai}, Cabang: ${row.cabang}, Kota: ${row.kota},Tanggal Aktivitas: ${row.tanggalAktivitas}, Aktivitas: ${row.aktivitas}, Jenis Produk: ${row.jenisProduk}\n`;
    });
    return content;
  };

  const downloadExcel = (data, fileName) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    worksheet.columns = Object.keys(data[0]).map((key) => ({
      header: key,
      key: key,
    }));
    worksheet.addRows(data);

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `${fileName}.xlsx`);
    });
  };

  const downloadSummaryPDF = (data, fileName) => {
    const doc = new jsPDF();
    const content = generateSummaryPDFContent(data);
    let y = 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Nama", 10, y);
    doc.text("Cabang", 50, y);
    doc.text("Kota", 90, y);
    doc.text("Closing (%)", 130, y);
    doc.text("Total Laporan", 170, y);
    doc.text("Total Closing", 210, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    data.forEach((row) => {
      doc.text(row.nama, 10, y);
      doc.text(row.cabang, 50, y);
      doc.text(row.kota, 90, y);
      doc.text(row.closing + "%", 130, y);
      doc.text(row.totalLaporan, 170, y);
      doc.text(row.totalClosing, 210, y);
      y += 10;
    });
    doc.save(`${fileName}.pdf`);
  };

  const downloadDetailPDF = (data, fileName) => {
    const doc = new jsPDF();
    const content = generateDetailPDFContent(data);
    let y = 10;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Tanggal Aktivitas", 10, y);
    doc.text("Aktivitas", 50, y);
    doc.text("Jenis Produk", 90, y);
    doc.text("Nama Pegawai", 130, y);
    doc.text("Cabang", 170, y);
    doc.text("Kota", 210, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    data.forEach((row) => {
      doc.text(row.tanggalAktivitas, 10, y);
      doc.text(row.aktivitas, 50, y);
      doc.text(row.jenisProduk, 90, y);
      doc.text(row.namaPegawai, 130, y);
      doc.text(row.cabang, 170, y);
      doc.text(row.kota, 210, y);
      y += 10;
    });
    doc.save(`${fileName}.pdf`);
  };

  return (
    <>
      <div className="bg-white border rounded-lg p-4 sm:p-6 xl:p-8 mx-4 sm:mx-6 xl:mx-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Activity Report
            </h3>
            <span className="text-base font-normal text-gray-500">
              Pilih periode, kota, cabang, dan tipe laporan
            </span>
          </div>
        </div>
        <div className="flex flex-col mt-8">
          <div className="overflow-x-auto rounded-lg">
            <form
              onSubmit={handleSubmit}
              className="flex flex-wrap gap-4 items-end"
            >
              <div className="flex flex-col">
                <label className="mb-1 text-gray-700 font-semibold">
                  Periode
                </label>
                <input
                  type="month"
                  name="periode"
                  value={formData.periode}
                  onChange={handleChange}
                  className="p-2 border rounded"
                />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-gray-700 font-semibold">Kota</label>
                <select
                  name="kota"
                  value={formData.kota}
                  onChange={handleChange}
                  className="p-2 w-48 border rounded"
                >
                  <option value="">Pilih Kota</option>
                  {[...new Set(tableData.map((item) => item.kota))].map(
                    (kota, index) => (
                      <option key={index} value={kota}>
                        {kota}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-gray-700 font-semibold">
                  Cabang
                </label>
                <select
                  name="cabang"
                  value={formData.cabang}
                  onChange={handleChange}
                  className="p-2 w-48 border rounded"
                >
                  <option value="">Pilih Cabang</option>
                  {formData.kota !== "" &&
                    [
                      ...new Set(
                        tableData
                          .filter((item) => item.kota === formData.kota)
                          .map((item) => item.cabang)
                      ),
                    ].map((cabang, index) => (
                      <option key={index} value={cabang}>
                        {cabang}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 text-gray-700 font-semibold">
                  Tipe Laporan
                </label>
                <select
                  name="tipe_laporan"
                  value={formData.tipe_laporan}
                  onChange={handleChange}
                  className="p-2 w-48 border rounded"
                >
                  <option value="">Pilih Tipe Laporan</option>
                  <option value="summary">Summary</option>
                  <option value="detail">Detail</option>
                </select>
              </div>
              <button
                type="submit"
                className="text-sm font-medium text-cyan-600 hover:bg-gray-100 rounded-lg p-2"
              >
                Tampilkan Laporan
              </button>{" "}
            </form>
          </div>
        </div>
      </div>
      {showSummary && (
        <div className="bg-white border rounded-lg p-4 sm:p-6 xl:p-8 mx-4 sm:mx-6 xl:mx-8 mt-8">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-xl leading-none font-bold text-gray-900">
              Summary
            </h3>
            <button
              onClick={() => downloadExcel(filteredSummaryData, "summary")}
              className="py-2 px-4 bg-green-500 text-white rounded-lg ml-auto"
            >
              Download Excel
            </button>
            {/* <button onClick={() => downloadSummaryPDF(filteredSummaryData, 'summary')} className="py-2 px-4 bg-blue-500 text-white rounded-lg ml-4">Download PDF</button> */}
          </div>

          <table className="min-w-full mt-4 bg-white">
            <thead>
              <tr>
                <th className="py-2">Nama</th>
                <th className="py-2">Cabang</th>
                <th className="py-2">Kota</th>
                <th className="py-2">Closing (%)</th>
                <th className="py-2">Total Laporan</th>
                <th className="py-2">Total Closing</th>
                <th className="py-2">Total Bintang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSummaryData.map((row, index) => (
                <tr key={index} className="text-gray-500">
                  <th className="border-t-0 px-4 align-middle text-sm font-normal whitespace-nowrap p-4 text-left">
                    {row.nama}
                  </th>
                  <td className="border-t-0 px-4 align-middle text-sm font-medium text-gray-900 whitespace-nowrap p-4">
                    {row.cabang}
                  </td>
                  <td className="border-t-0 px-4 align-middle text-sm font-medium text-gray-900 whitespace-nowrap p-4">
                    {row.kota}
                  </td>

                  <td className="border-t-0 px-4 align-middle text-sm whitespace-nowrap p-4">
                    <div className="flex items-center">
                      <span className="mr-2 text-sm font-medium">
                        {row.closing}
                      </span>
                      <div className="relative w-full">
                        <div className="w-full bg-gray-200 rounded-sm h-2">
                          <div
                            className={`h-2 rounded-sm ${row.closing >= 50 ? "bg-cyan-600" : row.closing >= 30 ? "bg-orange-300" : "bg-teal-400"}`}
                            style={{ width: `${row.closing}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="border-t-0 px-4 align-middle text-sm font-medium text-gray-900 whitespace-nowrap p-4">
                    {row.totalLaporan}
                  </td>
                  <td className="border-t-0 px-4 align-middle text-sm font-medium text-gray-900 whitespace-nowrap p-4">
                    {row.totalClosing}
                  </td>
                  <td className="border-t-0 px-4 align-middle text-sm font-medium text-gray-900 whitespace-nowrap p-4">
                    {row.totalBintang}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showDetail && (
        <div className="bg-white border  rounded-lg p-4 sm:p-6 xl:p-8 mx-4 sm:mx-6 xl:mx-8 mt-8">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-xl leading-none font-bold text-gray-900">
              Detail
            </h3>
            <button
              onClick={() => downloadExcel(filteredDetailData, "detail")}
              className="py-2 px-4 bg-green-500 text-white rounded-lg ml-auto"
            >
              Download Excel
            </button>
            <button
              onClick={() => downloadDetailPDF(filteredDetailData, "detail")}
              className="py-2 px-4 bg-blue-500 text-white rounded-lg ml-4"
            >
              Download PDF
            </button>
          </div>
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                <th className="px-4 bg-gray-50 text-gray-700 align-middle py-3 text-xs font-semibold text-left uppercase border-l-0 border-r-0 whitespace-nowrap">
                    Nama Pegawai
                  </th>
                  <th className="px-4 bg-gray-50 text-gray-700 align-middle py-3 text-xs font-semibold text-left uppercase border-l-0 border-r-0 whitespace-nowrap">
                    Cabang
                  </th>
                  <th className="px-4 bg-gray-50 text-gray-700 align-middle py-3 text-xs font-semibold text-left uppercase border-l-0 border-r-0 whitespace-nowrap">
                    Kota
                  </th>
                  <th className="px-4 bg-gray-50 text-gray-700 align-middle py-3 text-xs font-semibold text-left uppercase border-l-0 border-r-0 whitespace-nowrap">
                    Tanggal Aktivitas
                  </th>
                  <th className="px-4 bg-gray-50 text-gray-700 align-middle py-3 text-xs font-semibold text-left uppercase border-l-0 border-r-0 whitespace-nowrap">
                    Aktivitas
                  </th>
                  <th className="px-4 bg-gray-50 text-gray-700 align-middle py-3 text-xs font-semibold text-left uppercase border-l-0 border-r-0 whitespace-nowrap">
                    Jenis Produk
                  </th>
                  
                  <th className="px-4 bg-gray-50 text-gray-700 align-middle py-3 text-xs font-semibold text-left uppercase border-l-0 border-r-0 whitespace-nowrap">
                    bintang
                  </th>
                  <th className="px-4 bg-gray-50 text-gray-700 align-middle py-3 text-xs font-semibold text-left uppercase border-l-0 border-r-0 whitespace-nowrap">
                    closing
                  </th>
                  <th className="px-4 bg-gray-50 text-gray-700 align-middle py-3 text-xs font-semibold text-left uppercase border-l-0 border-r-0 whitespace-nowrap">
                    keterangan closing
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDetailData.map((row, index) => (
                  <tr key={index} className="text-gray-500">
                    <td className="border-t-0 px-4 align-middle text-sm font-medium text-gray-900 whitespace-nowrap p-4">
                      {row.namaPegawai}
                    </td>
                    <td className="border-t-0 px-4 align-middle text-sm font-medium text-gray-900 whitespace-nowrap p-4">
                      {row.cabang}
                    </td>
                    <td className="border-t-0 px-4 align-middle text-sm font-medium text-gray-900 whitespace-nowrap p-4">
                      {row.kota}
                    </td>
                    <td className="border-t-0 px-4 align-middle text-sm font-normal whitespace-nowrap p-4 text-left">
                      {row.tanggalAktivitas}
                    </td>
                    <td className="border-t-0 px-4 align-middle text-sm font-medium text-gray-900 whitespace-nowrap p-4">
                      {row.aktivitas}
                    </td>
                    <td className="border-t-0 px-4 align-middle text-sm font-medium text-gray-900 whitespace-nowrap p-4">
                      {row.jenisProduk}
                    </td>
                    
                    <td className="border-t-0 px-4 align-middle text-sm font-medium text-gray-900 whitespace-nowrap p-4">
                      {row.bintang}
                    </td>
                    <td className="border-t-0 px-4 align-middle text-sm font-medium text-gray-900 whitespace-nowrap p-4">
                      {row.closing}
                    </td>
                    <td className="border-t-0 px-4 align-middle text-sm font-medium text-gray-900 whitespace-nowrap p-4">
                      {row.ket_closing}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default LaporanForm;
