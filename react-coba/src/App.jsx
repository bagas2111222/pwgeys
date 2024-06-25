import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import About from "./pages/About";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import CabangBesar from "./pages/CabangBesar";
import Pegawaikota from "./pages/Pegawaikota";
import Allcabangkota from "./pages/allcabangkota";
import AllPegawai from "./pages/AllPegawai";
import AllReport from "./pages/Report/AllReport";

import ReportPegawai from "./pages/Report/ReportPegawai";
import Dash from "./pages/dash";
import FormPegawai from "./pages/pegawai/FormLaporan";
import Navbar from "./components/Navbar";
import Navbar2 from "./components/NavbarPegawai";
import DashPegawai from "./pages/pegawai/dash";
import ReportP from "./pages/pegawai/ReportPegawai";
import FormSaja from "./pages/pegawai/FormSaja";

export default function App() {
    return (
        <main className="min-h-screen pt-8">
            <Router />
        </main>
    );
}

function Router() {
    const location = useLocation();
    const [navbarType, setNavbarType] = useState("default");

    useEffect(() => {
        const path = location.pathname;
        const isLoginPage = path === "/login";
        const isRegisterPage = path === "/register";
        const isFormPegawaiPage = /^\/Pegawai\/FormPegawai\/[^/]+\/[^/]+$/.test(path);
        const isFormPegawaiPage3 = path === "/form/pegawai";
        const isFormPegawaiPage2 = path === "/Pegawai";
        const isFormPegawaiPage21 = path === "/Pegawai/Aktifitas";

        if (isLoginPage || isFormPegawaiPage || isRegisterPage|| isFormPegawaiPage3) {
            setNavbarType("none");
        } else if (isFormPegawaiPage2 || isFormPegawaiPage21) {
            setNavbarType("navbar2");
        } else {
            setNavbarType("default");
        }
    }, [location.pathname]);

    return (
        <>
            <Routes>
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
            </Routes>

            {/* Conditionally render the Navbar */}
            {navbarType === "default" && <Navbar />}
            {navbarType === "navbar2" && <Navbar2 />}

            <Routes>
                <Route path="/" element={<Dash />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="allcabangkota" element={<Allcabangkota />} />
                <Route path="AllPegawai" element={<AllPegawai />} />
                <Route path="AllReport" element={<AllReport />} />
                <Route path="/form/pegawai" element={<FormSaja />} />
                <Route path="/cabangbesar/:id" element={<CabangBesar />} />
                <Route path="/PegawaiKota/:id/:bulan/:tahun" element={<Pegawaikota />} />
                <Route path="ReportPegawai/:id/:bulan/:tahun" element={<ReportPegawai />} />
                <Route path="about" element={<About />} />
                <Route path="/Pegawai/FormPegawai/:id/:cabang" element={<FormPegawai />} />
                <Route path="Pegawai" element={<DashPegawai />} />
                <Route path="/Pegawai/Aktifitas" element={<ReportP />} />
            </Routes>
        </>
    );
}
