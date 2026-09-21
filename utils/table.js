import {downloadCsvFile, getToken} from "@/utils/index";
import AccessService from "@/services/Access";
import Toast from "@/utils/toast";
import {displayHttpError} from "@/utils/api";

class TableUtils {
  /**
   *
   * @type {array}
   */
  filtered = [];
  records = [];
  /**
   *
   * @type {{activeColumn: any, announceText: string, columnOrder: array, columns: array, count: number, data: array, displayData: array, expandedRows: array, filterData: array, filterList: array, page: number, previousSelectedRow: any, rowsPerPage: number, rowsPerPageOptions: array, searchProps: any, searchText: string, selectedRows: array, showResponsive: boolean, sortOrder: any}}
   */
  globalTableState = {};

  getRecord() {
    if (this.filtered.length === 0) {
      return this.records;
    } else {
      return this.filtered;
    }
  }

  setRecord(tab = []) {
    console.log("Setting record::: ", tab);
    this.records = tab;
  }

  map(tab = [], data = []) {
    return tab.map(obj => {
      const found = data.filter(elem => elem.uid === obj.id);
      return found[0];
    });
  }
  /**
   *
   * @param fn {function}
   * @param search
   * @param sortOrder
   * @param keyData {string}
   * @param sortFn {function}
   * @returns {Promise<{data: array, total: number}>}
   */
  async handleSearch(fn, search, sortOrder = {}, keyData = "data", sortFn) {
    const result = await fn(search);
    return this.handleSort(this.records, sortOrder, sortFn);
  }

  /**
   *
   * @param data
   * @param sortOrder
   * @param fn {function}
   * @returns {{total: number, data: *[]}}
   */
  handleSort(data = [], sortOrder = {}, fn) {
    let datas = fn(data);
    const total = datas.length;
    let sortField = sortOrder.name;
    let sortDir = sortOrder.direction;

    if (sortField) {
      datas = datas.sort((a, b) => {
        if (a[sortField] < b[sortField]) {
          return 1 * (sortDir === "asc" ? -1 : 1);
        } else if (a[sortField] > b[sortField]) {
          return -1 * (sortDir === "asc" ? -1 : 1);
        } else {
          return 0;
        }
      });
    }
    return {
      data: datas.map(item => {
        const found = data.filter(elem => elem.uid === item.id);
        return found[0];
      }),
      total,
    };
  }
  handleFilter(data = [], tableState = {}, fn) {
    const filters = [];
    tableState.filterList.forEach((item, index) => {
      if (item.length) {
        const column = tableState.columns[index];
        filters.push({name: column.name, value: item[0]});
      }
    });
    let datas = fn(data);
    console.log("Filters::: ", filters);
    filters.forEach(item => {
      datas = datas.filter(elem => elem[item.name] === item.value);
    });
    this.filtered = this.map(datas, data);

    if (!filters.length) {
      this.filtered = [];
    }
  }

  async handleChangePage(fn, _tableState, sortFn) {
    window.scrollTo(0, 0);
    const searchText = _tableState.searchText ?? "";
    await fn(_tableState.page + 1, searchText, undefined, _tableState.rowsPerPage);
    this.handleFilter(this.records, _tableState, sortFn);
    return this.handleSort(this.getRecord(), _tableState.sortOrder, sortFn);
  }

  async handleRowPerPageChange(fn, _tableState, sortFn) {
    window.scrollTo(0, 0);
    const searchText = _tableState.searchText ?? "";
    await fn(1, searchText, undefined, _tableState.rowsPerPage);
    this.handleFilter(this.records, _tableState, sortFn);
    return this.handleSort(this.getRecord(), _tableState.sortOrder, sortFn);
  }

  handleFilterByStatus(_status = "") {
    if (_status === "all") {
      return this.getRecord();
    }
    let data = this.getRecord();
    return data.filter(item => item.status === _status);
  }

  isRowsSelected() {
    return (
      this.globalTableState.curSelectedRows &&
      this.globalTableState.curSelectedRows.length === this.globalTableState.rowsPerPage
    );
  }

  getExportableRows() {
    const tab = [];
    if (this.globalTableState.selectedRows && this.globalTableState.selectedRows.data.length > 0) {
      this.globalTableState.selectedRows.data.forEach(item => {
        tab.push(this.records[item.index]);
      });
      return tab;
    }
    return this.records;
  }

  async handleDownload(columns = [], fn, allData = false, getData) {
    let header,
      tab = [],
      csv = "";
    header = columns.filter(item => !item.unexport);
    if (allData) {
      const result = await getData(getToken(), null, this.globalTableState.searchText ?? "");
      if (result.error == null) {
        tab = fn(result.data);
      } else {
        displayHttpError(result.error, null);
      }
    } else tab = fn(this.getExportableRows());

    for (let i = 0; i < header.length; i++) {
      if (i === 0) csv += header[i].label;
      else {
        csv += "; " + header[i].label;
      }
    }
    csv += "\n";
    tab.forEach(item => {
      for (let i = 0; i < header.length; i++) {
        if (i === 0) csv += item[header[i].name];
        else {
          csv += "; " + item[header[i].name];
        }
      }
      csv += "\n";
    });
    console.log("Csv value::: ", csv);
    downloadCsvFile(csv);
  }

  /**
   *
   * @param action {string}
   * @param tableState {{activeColumn: any, announceText: string, columnOrder: array, columns: array, count: number, data: array, displayData: array, expandedRows: array, filterData: array, filterList: array, page: number, previousSelectedRow: any, rowsPerPage: number, rowsPerPageOptions: array, searchProps: any, searchText: string, selectedRows: array, showResponsive: boolean, sortOrder: any}}
   * @param setState {function}
   * @param searchService {function}
   * @param toggleProgress {function}
   * @param getData {function}
   * @param formatDataFn {function}
   * @param keyData {string}
   */
  async onTableChange(
    action,
    tableState,
    setState,
    searchService,
    toggleProgress,
    getData,
    formatDataFn,
    keyData = "data",
  ) {
    this.globalTableState = tableState;
    switch (action) {
      case "changePage":
        toggleProgress(true);
        const changeResult = await this.handleChangePage(getData, tableState, formatDataFn);
        setState(changeResult.data);
        toggleProgress(false);
        break;
      case "search":
        if (tableState.searchText && tableState.searchText.length > 2) {
          const result = await this.handleSearch(
            searchService,
            tableState.searchText,
            tableState.sortOrder,
            keyData,
            formatDataFn,
          );
          setState(result.data);
        }
        break;
      case "sort":
        const dataSorted = this.handleSort(this.getRecord(), tableState.sortOrder, formatDataFn);
        console.log("Sorted::: ", dataSorted);
        setState(dataSorted.data);
        break;
      case "filterChange":
        this.handleFilter(this.records, tableState, formatDataFn);
        console.log("Filtered::: ", this.filtered, this.records);
        const sorted = this.handleSort(this.getRecord(), tableState.sortOrder, formatDataFn);
        setState(sorted.data);
        break;
      case "onSearchClose":
        toggleProgress(true);
        await getData(1);
        toggleProgress(false);
        break;
      case "propsUpdate":
        console.log("Do nothing");
        break;
      case "changeRowsPerPage":
        console.log("Changed row per page...");
        toggleProgress(true);
        const perPageChangeResult = await this.handleRowPerPageChange(getData, tableState, formatDataFn);
        setState(perPageChangeResult.data);
        toggleProgress(false);
        break;
      case "rowSelectionChange":
        console.log("Table state::: ", tableState);
        break;
      default:
        console.log("Action:::", action);
    }
  }
}

export default TableUtils;
