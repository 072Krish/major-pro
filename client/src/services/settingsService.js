import axios from "axios";

const API_URL =
    "http://localhost:5000/api/settings";

const getAuthConfig = () => {

    const token =
        localStorage.getItem("token");

    return {

        headers: {
            Authorization: `Bearer ${token}`,
        },

    };

};


// ======================================
// GET SETTINGS
// ======================================

export const getSettingsAPI = async () => {

    const response = await axios.get(

        API_URL,

        getAuthConfig()

    );

    return response.data;

};


// ======================================
// UPDATE SETTINGS
// ======================================

export const updateSettingsAPI = async (
    settings
) => {

    const response = await axios.put(

        API_URL,

        settings,

        getAuthConfig()

    );

    return response.data;

};