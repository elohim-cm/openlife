import React, {useEffect, useState} from "react";
import MDBox from "@/material/components/MDBox";
import Grid from "@mui/material/Unstable_Grid2";
import Autocomplete from "@mui/material/Autocomplete";
import {Button, TextField, Tooltip} from "@mui/material";
import {useAppContext} from "@/contexts/appContext";
import DataTable from "@/material/template/Tables/DataTable";
import LinearProgressWithLabel from "@/components/LinearProgressWithLabel";
import MDTypography from "@/material/components/MDTypography";
import {getColorByIndicator} from "@/utils/theme";
import {Refresh} from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import dynamic from "next/dynamic";
import {useTranslation} from "react-i18next";
import {formatNumber, getLanguage, getToken} from "@/utils";
import ActivityIndicator from "@/components/ActivityIndicator";
import DashboardService from "@/services/DashboardService";
import {displayHttpError} from "@/utils/api";
import {useRouter} from "next/navigation";
import NoData from "@/components/NoData";
const ApexChart = dynamic(() => import("react-apexcharts"), {ssr: false});

const inputSize = "normal";
const inputType = "filled";

const DashboardDcom = ({dashboard, onRefresh}) => {
  const [network, setNetwork] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const context = useAppContext();
  const {t} = useTranslation();
  const router = useRouter();

  useEffect(() => {
    if (dashboard != null && dashboard.subscription != null) {
      setPageData({
        chart: [
          {
            type: "subscription",
            label: t("subscriptions"),
            value: Math.floor(
              (dashboard.subscription[0].val_subscriptions * 100) / dashboard.subscription[0].obj_subscriptions,
            ),
            total: dashboard.subscription[0].obj_subscriptions,
            done: dashboard.subscription[0].val_subscriptions,
          },
          {
            type: "collection",
            label: t("collections"),
            value: Math.floor((dashboard.collection[0].val_collection * 100) / dashboard.collection[0].obj_collection),
            total: dashboard.collection[0].obj_collection,
            done: dashboard.collection[0].val_collection,
          },
        ],
        subscription: dashboard.subscription[0].obj_networks
          .filter(item => {
            return item.network_name !== undefined;
          })
          .map(item => ({
            name: item.network_name,
            performance: Math.floor(
              (item.subscription[0].val_subscriptions * 100) / item.subscription[0].obj_subscriptions,
            ),
            value: (
              <span>
                {item.subscription[0].val_subscriptions}&nbsp;/&nbsp;{item.subscription[0].obj_subscriptions}
              </span>
            ),
            details: 1,
          })),
        collection: dashboard.collection[0].obj_networks
          .filter(item => {
            return item.network_name !== undefined;
          })
          .map(item => ({
            name: item.network_name,
            performance: Math.floor((item.collection[0].val_collection * 100) / item.collection[0].obj_collection),
            value: (
              <span>
                {formatNumber(item.collection[0].val_collection, getLanguage())}&nbsp;/&nbsp;
                {formatNumber(item.collection[0].obj_collection, getLanguage())}
              </span>
            ),
            details: 2,
          })),
      });
    }
  }, [dashboard]);

  const columns = [
    {
      accessor: "name",
      Header: () => <span>{t("network")}</span>,
      isSorted: true,
    },
    {
      accessor: "performance",
      Header: () => <span>Performance</span>,
      width: 200,
      Cell: _cellProps => {
        return (
          <LinearProgressWithLabel
            value={_cellProps.cell.value}
            sx={{
              "& span.MuiLinearProgress-bar": {
                background: getColorByIndicator(context.theme, _cellProps.cell.value).main,
              },
            }}
          />
        );
      },
    },
    {
      accessor: "value",
      Header: () => <span>{t("value")}</span>,
    },
    {
      accessor: "details",
      Header: () => <span>{t("details")}</span>,
      Cell: _cellProps => {
        return (
          <Button onClick={openDetails} startIcon={<VisibilityIcon />}>
            Ouvrir le détail
          </Button>
        );
      },
    },
  ];

  const buildChart = item => {
    return {
      chart: {
        height: 280,
        type: "radialBar",
      },
      series: [item.value],
      colors: [getColorByIndicator(context.theme, item.value).main],
      plotOptions: {
        radialBar: {
          hollow: {
            margin: 0,
            size: "70%",
            background: "#fff",
          },
          track: {
            dropShadow: {
              enabled: true,
              top: 2,
              left: 0,
              blur: 4,
              opacity: 0.15,
            },
          },
          dataLabels: {
            name: {
              offsetY: -10,
              color: "#293450",
              fontSize: "13px",
            },
            value: {
              color: "#293450",
              fontSize: "30px",
              show: true,
            },
          },
        },
      },
      // fill: {
      //   type: "gradient",
      //   gradient: {
      //     shade: "dark",
      //     type: "vertical",
      //     gradientToColors: [getColorByIndicator(context.theme, item.value).light],
      //     stops: [0, 100],
      //   },
      // },
      stroke: {
        lineCap: "round",
      },
      labels: [item.label],
    };
  };

  const handleRefresh = async () => {
    if (startDate !== "") {
      setInProgress(true);
      const result = await DashboardService.getForNetwork(getToken(), startDate, endDate);
      setInProgress(false);
      if (result.error == null) {
        onRefresh(result.data);
      } else {
        displayHttpError(result.error, router);
      }
    }
  };

  const openDetails = _network => {};

  if (dashboard != null && dashboard.subscription != null) {
    return pageData != null ? (
      <MDBox mb={2} sx={{position: "relative"}}>
        <ActivityIndicator visible={inProgress} />
        <MDBox mb={2} sx={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
          <MDBox sx={{width: "100%", mr: 2}}>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6} md={4} lg={4} xl={4}>
                <TextField
                  label="Date de début"
                  onChange={e => {
                    setStartDate(e.target.value);
                  }}
                  value={startDate}
                  type={"date"}
                  fullWidth
                  InputLabelProps={{shrink: true}}
                  variant={inputType}
                />
              </Grid>
              <Grid xs={12} sm={6} md={4} lg={4} xl={4}>
                <TextField
                  label="Date de fin"
                  onChange={e => {
                    setEndDate(e.target.value);
                  }}
                  value={endDate}
                  fullWidth
                  type={"date"}
                  InputLabelProps={{shrink: true}}
                  variant={inputType}
                />
              </Grid>
            </Grid>
          </MDBox>
          <Button onClick={handleRefresh} startIcon={<Refresh />}>
            Actualiser
          </Button>
        </MDBox>
        <div>
          <Grid container spacing={2}>
            {pageData.chart.map((item, index) => (
              <Grid key={`grid-chart-${index}`} xs={12} sm={6} md={6} lg={6} xl={6}>
                <Tooltip title={`${item.done} / ${item.total}`}>
                  <ApexChart
                    options={buildChart(item)}
                    series={buildChart(item).series}
                    type="radialBar"
                    height={300}
                  />
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </div>
        <MDBox mb={3}>
          <MDTypography variant="h6" mb={2}>
            Souscription
          </MDTypography>
          <DataTable
            entriesPerPage={false}
            showTotalEntries={false}
            table={{
              rows: pageData.subscription,
              columns,
            }}
          />
        </MDBox>
        <div>
          <MDTypography variant="h6" mb={2}>
            Encaissement
          </MDTypography>
          <DataTable
            entriesPerPage={false}
            showTotalEntries={false}
            table={{
              rows: pageData.collection,
              columns,
            }}
          />
        </div>
      </MDBox>
    ) : null;
  } else {
    return <NoData />;
  }
};

export default DashboardDcom;
