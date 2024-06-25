import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Case from "../components/Case";

export default function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            // Redirect ke halaman login jika token tidak tersedia
            navigate("/login");
        }
    }, [navigate]);

    return (
        <Case>
            <div className="w-full max-w-lg">
                <h4 className="text-2xl">Hello React</h4>
                <p className="text-lg leading-relaxed text-gray-400">
                    A JavaScript library for building user interfaces
                </p>
            </div>
        </Case>
    );
}
