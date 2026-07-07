import API from "./api";

const getAuthHeader = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// Add Transaction
export const addTransactionAPI = async (transactionData) => {
    const response = await API.post(
        "/transactions",
        transactionData,
        getAuthHeader()
    );

    return response.data;
};

// Get Transactions
export const getTransactionsAPI = async () => {
    const response = await API.get(
        "/transactions",
        getAuthHeader()
    );

    return response.data;
};

// Delete Transaction
export const deleteTransactionAPI = async (id) => {
    const response = await API.delete(
        `/transactions/${id}`,
        getAuthHeader()
    );

    return response.data;
};

export const updateTransactionAPI = async (id, transactionData) => {
    const response = await API.put(
        `/transactions/${id}`,
        transactionData,
        getAuthHeader()
    );

    return response.data;
};