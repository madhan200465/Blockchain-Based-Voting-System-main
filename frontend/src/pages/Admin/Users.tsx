import React, { useEffect, useState } from "react";
import axios from "../../axios";

type User = {
  id: number;
  name: string;
  citizenshipNumber: string;
  email: string;
    voterId?: string | null;
};

const Users = () => {
    const [pendingUsers, setPendingUsers] = useState<User[]>([]);
    const [verifiedUsers, setVerifiedUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<"pending" | "registry">("pending");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async (initialLoad = false) => {
        if (initialLoad) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        try {
            const [pendingRes, verifiedRes] = await Promise.all([
                axios.get("/users/all"),
                axios.get("/users/verified")
            ]);
            setPendingUsers(pendingRes.data.users);
            setVerifiedUsers(verifiedRes.data.users);
        } catch (error) {
            console.log({ error });
        } finally {
            if (initialLoad) {
                setLoading(false);
            }

            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData(true);

        const interval = setInterval(() => {
            fetchData(false);
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const verifyUser = (id: number | string) => {
        axios
            .post("/users/verify", { userId: id })
            .then(() => fetchData())
            .catch((error) => console.log({ error }));
    };

    const revokeUser = (id: number | string) => {
        if (window.confirm("Are you sure you want to revoke this voter's verification? They will no longer be able to cast votes.")) {
            axios
                .post("/users/revoke", { userId: id })
                .then(() => fetchData())
                .catch((error) => console.log({ error }));
        }
    };

    const deleteUser = (id: number | string) => {
        if (window.confirm("Permanently delete this registration request?")) {
            axios
                .delete(`/users/delete/${id}`)
                .then(() => fetchData())
                .catch((error) => console.log({ error }));
        }
    };

    if (loading) return <div className="loading-state">Loading Voter Management System...</div>;

    const currentList = activeTab === "pending" ? pendingUsers : verifiedUsers;

    return (
        <div className="admin-dashboard-container">
            <div className="dashboard-header">
                <h2 className="title-small">Voter Management System</h2>
                <p className="text-normal">Review registration requests and manage the active voter registry.</p>
                <button
                    onClick={() => fetchData(false)}
                    className="button-secondary refresh-button"
                    disabled={refreshing}
                >
                    {refreshing ? 'Refreshing...' : 'Refresh Requests'}
                </button>
            </div>

            <div className="tab-navigation">
                <button 
                  onClick={() => setActiveTab("pending")}
                  className={`tab-item ${activeTab === 'pending' ? 'active' : ''}`}
                >
                    Pending Requests ({pendingUsers.length})
                </button>
                <button 
                  onClick={() => setActiveTab("registry")}
                  className={`tab-item ${activeTab === 'registry' ? 'active registry' : ''}`}
                >
                    Active Voter Registry ({verifiedUsers.length})
                </button>
            </div>
            
            <div className="users-wrapper dashboard-content">
                {currentList.length === 0 ? (
                    <div className="empty-state">
                        <i className={`bi ${activeTab === 'pending' ? 'bi-person-check' : 'bi-people'}`}></i>
                        <p>{activeTab === 'pending' ? 'No pending verification requests.' : 'The voter registry is currently empty.'}</p>
                    </div>
                ) : (
                    currentList.map((user, index) => (
                        <div key={index} className="user-wrapper card-premium">
                            <div className="user-info">
                                <div className="user-name">{user.name}</div>
                                <div className="user-email">{user.email}</div>
                                <div className={`user-id ${activeTab === 'pending' ? 'pending' : 'registry'}`}>
                                    <i className="bi bi-card-text"></i>
                                    {activeTab === 'pending'
                                      ? `Voter ID: Pending assignment (Citizenship: ${user.citizenshipNumber})`
                                      : `Voter ID: ${user.voterId || "Not assigned"}`}
                                </div>
                            </div>

                            <div className="user-actions">
                                {activeTab === "pending" ? (
                                    <>
                                        <button
                                            onClick={() => verifyUser(user.id)}
                                            className="button-primary"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => deleteUser(user.id)}
                                            className="button-black"
                                        >
                                            Reject
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => revokeUser(user.id)}
                                        className="button-secondary danger"
                                    >
                                        Revoke Access
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Users;
