import React, { useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import CardMenu from "components/card/CardMenu";
import Card from "components/card";
import { useGlobalFilter, usePagination, useSortBy, useTable } from "react-table";
import { MdCheckCircle, MdCancel } from "react-icons/md";

const ComplexTable = (props) => {
  const { columnsData, tableData, isLoading } = props;

  const columns = useMemo(() => columnsData, [columnsData]);
  const data = useMemo(() => tableData, [tableData]);

  const tableInstance = useTable(
    { columns, data },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    initialState,
  } = tableInstance;
  initialState.pageSize = 5;

  const skeletonRows = Array(4).fill(null); // Adjust number of skeleton rows

  const truncate = (str, n) => (str.length > n ? str.substr(0, n - 1) + "..." : str);

  return (
    <Card extra={"w-full h-full px-6 pb-6 sm:overflow-x-auto"}>
      <div className="relative flex items-center justify-between pt-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          Product Table
        </div>
        {/* <CardMenu /> */}
      </div>

      <div className="mt-8 overflow-x-scroll xl:overflow-hidden">
        <table {...getTableProps()} className="w-full">
          <thead>
            {headerGroups.map((headerGroup, index) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                {headerGroup.headers.map((column, index) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    key={index}
                    className="border-b border-gray-200 pr-28 pb-[10px] text-start dark:!border-navy-700"
                  >
                    <p className="text-xs tracking-wide text-gray-600">
                      {column.render("Header")}
                    </p>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {isLoading ? (
              skeletonRows.map((_, index) => (
                <tr key={index}>
                  {columns.map((column, index) => (
                    <td
                      className="pt-[14px] pb-[18px] sm:text-[14px]"
                      key={index}
                    >
                      <Skeleton height={20} />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              page.map((row, index) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} key={index}>
                    {row.cells.map((cell, index) => {
                      let data = "";
                      if (cell.column.Header === "NAME") {
                        data = (
                          <p className="text-sm font-bold text-navy-700 dark:text-white" title={cell.value}>
                            {truncate(cell.value, 20)}
                          </p>
                        );
                      } else if (cell.column.Header === "STATUS") {
                        data = (
                          <div className="flex items-center gap-2">
                            <div className={`rounded-full text-xl`}>
                              {cell.value === "active" ? (
                                <MdCheckCircle className="text-green-500" />
                              ) : (
                                <MdCancel className="text-red-500" />
                              )}
                            </div>
                            <p className="text-sm font-bold text-navy-700 dark:text-white">
                              {cell.value}
                            </p>
                          </div>
                        );
                      } else if (cell.column.Header === "DATE") {
                        data = (
                          <p className="text-sm font-bold text-navy-700 dark:text-white">
                            {new Date(cell.value).toLocaleDateString()}
                          </p>
                        );
                      }
                      return (
                        <td
                          className="pt-[14px] pb-[18px] sm:text-[14px]"
                          {...cell.getCellProps()}
                          key={index}
                        >
                          {data}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ComplexTable;
