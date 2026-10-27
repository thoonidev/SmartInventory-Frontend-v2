import React from "react";
import IconButton from "./IconButton";

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-6 flex items-center justify-center gap-1">
      <IconButton
        icon="previous"
        label="Pagina anterior"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />

      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`rounded-md border px-3 py-1.5 text-sm font-bold transition ${
            currentPage === number
              ? "border-[#123c69] bg-[#123c69] text-white"
              : "border-[#cfd6e2] bg-white text-[#465366] hover:bg-[#f8fafc]"
          }`}
        >
          {number}
        </button>
      ))}

      <IconButton
        icon="next"
        label="Pagina siguiente"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    </div>
  );
};

export default PaginationComponent;
