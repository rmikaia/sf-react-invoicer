import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import TableLoader from "../components/Loaders/TableLoader";
import Pagination from "../components/Pagination";
import ROUTES from "../constantes/routes";
import api from "../services/api";
import { getDeleteSuccess, getGenericError } from "../services/notification";
import { Customer } from "../types/customer";

const CustomersPage: React.FC = () => {
  const entity = "customers";
  const itemsPerPage = 10;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .fetch(entity)
      .then((fetchedCustomers) => {
        setLoading(false);
        setCustomers(fetchedCustomers);
      })
      .catch(() => toast.error(getGenericError()));
  }, []);

  const handleDelete = (customerId: number) => {
    const oldCustomers = [...customers];

    setCustomers(customers.filter((customer) => customer.id !== customerId));
    api
      .delete(entity, customerId)
      .then(() => toast.success(getDeleteSuccess("Le client")))
      .catch(() => {
        toast.error(getGenericError());
        setCustomers(oldCustomers);
      });
  };

  const handlePageChange = (currentPage: number) => {
    setCurrentPage(currentPage);
  };

  const handleSearch = ({
    currentTarget,
  }: {
    currentTarget: HTMLInputElement;
  }) => {
    setSearch(currentTarget.value.toLowerCase());
    setCurrentPage(1);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.firstName.toLowerCase().includes(search) ||
      customer.lastName.toLowerCase().includes(search) ||
      customer.email.toLowerCase().includes(search) ||
      (customer.company && customer.company.toLowerCase().includes(search))
  );

  const paginatedCustomers = Pagination.getData<Customer>(
    filteredCustomers,
    currentPage,
    itemsPerPage
  );

  return (
    <>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <h1>Liste des clients</h1>
        <Link to={ROUTES.CUSTOMERS_NEW} className="btn btn-primary">
          Créer un client
        </Link>
      </div>

      <input
        onChange={handleSearch}
        type="text"
        className="form-control"
        placeholder="Rechercher..."
      />

      {!loading && (
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Id.</th>
              <th>Client</th>
              <th>Email</th>
              <th>Entreprise</th>
              <th className="text-center">Facture</th>
              <th className="text-center">Montant total</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>
                  <Link to={`${ROUTES.CUSTOMERS}/${customer.id}`}>
                    {customer.firstName} {customer.lastName}
                  </Link>
                </td>
                <td>{customer.email}</td>
                <td>{customer.company}</td>
                <td className="text-center">
                  <button className="badge badge-primary">
                    {customer.invoices.length}
                  </button>
                </td>
                <td className="text-center">
                  {customer.totalAmount.toLocaleString()} €
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="btn btn-sm btn-danger"
                    disabled={customer.invoices.length > 0}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {loading && <TableLoader />}
      {itemsPerPage < filteredCustomers.length && (
        <Pagination
          totalItems={filteredCustomers.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          handlePageChange={handlePageChange}
        />
      )}
    </>
  );
};

export default CustomersPage;
