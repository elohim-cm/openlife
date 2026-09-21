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
import UtilMethods from "@/utils/UtilMethods";
const ApexChart = dynamic(() => import("react-apexcharts"), {ssr: false});

const inputSize = "normal";
const inputType = "filled";

const DashboardBusinessGoal = ({dashboard, onRefresh}) => {
  // Handle different API structures:
  // - PDG/ADMIN: {dashboard: [{subscription: [...], collection: [...]}], default_dates: {...}}
  // - Other roles: {dashboard: {subscription: [...], collection: [...]}, default_dates: {...}}
  let rawDashboard, effectiveDashboard;
  
  // First, extract the actual dashboard data (might be wrapped in {dashboard, default_dates})
  const unwrapped = dashboard?.dashboard || dashboard;
  
  if (Array.isArray(unwrapped)) {
    // PDG/ADMIN case: array of dashboards, take first one
    rawDashboard = dashboard; // Keep original for default_dates
    effectiveDashboard = unwrapped[0];
  } else {
    // Other roles: single object
    rawDashboard = dashboard;
    effectiveDashboard = unwrapped;
  }
  const [network, setNetwork] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [datesInitialized, setDatesInitialized] = useState(false);
  const context = useAppContext();
  const {t} = useTranslation();
  const router = useRouter();

  useEffect(() => {
    console.log("DashboardBusinessGoal - effectiveDashboard:", effectiveDashboard);
    
    // Pre-fill dates from dashboard default_dates if available and not yet initialized
    const defaultDates = rawDashboard?.default_dates;
    if (defaultDates && !datesInitialized) {
      setStartDate(defaultDates.start_date || "");
      setEndDate(defaultDates.end_date || "");
      setDatesInitialized(true);
    }
    
    if (
      effectiveDashboard != null &&
      effectiveDashboard.subscription != null &&
      effectiveDashboard.collection != null
    ) {
      console.log("DashboardBusinessGoal - processing subscription records:", effectiveDashboard.subscription[0]?.records);
      console.log("DashboardBusinessGoal - processing collection records:", effectiveDashboard.collection[0]?.records);
      
      const subscriptionData = effectiveDashboard.subscription?.[0] || {};
      const collectionData = effectiveDashboard.collection?.[0] || {};
      
      const subscriptionTarget = subscriptionData.target || 0;
      const subscriptionValue = subscriptionData.value || 0;
      const subscriptionPercentage = subscriptionTarget > 0 
        ? Math.floor((subscriptionValue * 100) / subscriptionTarget)
        : 0;
      
      const collectionTarget = collectionData.target || 0;
      const collectionValue = collectionData.value || 0;
      const collectionPercentage = collectionTarget > 0
        ? Math.floor((collectionValue * 100) / collectionTarget)
        : 0;

      setPageData({
        chart: [
          {
            type: "subscription",
            label: t("subscriptions"),
            value: subscriptionPercentage,
            total: subscriptionTarget,
            done: subscriptionValue,
            hasGoal: subscriptionTarget > 0,
          },
          {
            type: "collection",
            label: t("collections"),
            value: collectionPercentage,
            total: collectionTarget,
            done: collectionValue,
            hasGoal: collectionTarget > 0,
          },
        ],
        subscription: effectiveDashboard.subscription?.length > 0?(effectiveDashboard.subscription[0]?.records
          ?.filter(item => {
            console.log("Subscription filter item:", item);
            return item && item.name !== undefined;
          })
          .map(item => ({
            name: item.name,
            performance: (item.subscription?.[0]?.target ?? 0) > 0
              ? Math.floor(((item.subscription?.[0]?.value ?? 0) * 100) / item.subscription[0].target)
              : 0,
            value: (
              <span>
                {item.subscription?.[0]?.value ?? 0}&nbsp;/&nbsp;{item.subscription?.[0]?.target ?? 0}
              </span>
            ),
            details: 1,
          })) || []): [],
        collection: effectiveDashboard.collection?.length > 0? (effectiveDashboard.collection[0]?.records
          ?.filter(item => {
            console.log("Collection filter item:", item);
            return item && item.name !== undefined;
          })
          .map(item => ({
            name: item.name,
            performance: (item.collection?.[0]?.target ?? 0) > 0
              ? Math.floor(((item.collection?.[0]?.value ?? 0) * 100) / item.collection[0].target)
              : 0,
            value: (
              <span>
                {formatNumber(item.collection?.[0]?.value ?? 0, getLanguage())}&nbsp;/&nbsp;
                {formatNumber(item.collection?.[0]?.target ?? 0, getLanguage())}
              </span>
            ),
            details: 2,
          })) || []): [],
      });
    }
  }, [dashboard]);

  const getHeaderTableName = () => {
    if (dashboard == null || dashboard.subscription == null || !dashboard.subscription[0]?.records?.length) {
      return <span>{t("record")}</span>;
    } else {
      return <span>{t(dashboard.subscription[0]?.records[0]?.type)}</span>;
    }
  };

  const columns = [
    {
      accessor: "name",
      Header: getHeaderTableName,
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
            {t("openDetails")}
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
      labels: [item.hasGoal ? `${item.done} / ${item.total}` : t("noGoalDefined") || "Aucun objectif"],
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

  if (effectiveDashboard != null && effectiveDashboard.subscription != null) {
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
            {t("refresh")}
          </Button>
        </MDBox>
        {pageData.chart.some(item => !item.hasGoal) && (
          <MDBox mb={2} p={2} sx={{backgroundColor: "#fff3cd", borderRadius: 1, border: "1px solid #ffc107"}}>
            <MDTypography variant="body2" color="text">
              ℹ️ {t("noGoalsDefinedInfo") || "Aucun objectif n'est défini pour la période sélectionnée. Les valeurs affichées correspondent à la performance réelle."}
            </MDTypography>
          </MDBox>
        )}
        <div>
          <Grid container spacing={2}>
            {pageData.chart.map((item, index) => (
              <Grid key={`grid-chart-${index}`} xs={12} sm={6} md={6} lg={6} xl={6}>
                <Tooltip title={`${item.done} / ${item.total}`}>
                  <MDBox
                    sx={{display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
                    <MDTypography>{item.label}</MDTypography>
                    <ApexChart
                      options={buildChart(item)}
                      series={buildChart(item).series}
                      type="radialBar"
                      height={300}
                    />
                  </MDBox>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </div>
        {!UtilMethods.isProvider() && (
          <MDBox mb={3}>
            <MDTypography variant="h6" mb={2}>
              {t("subscription")}
            </MDTypography>
            <DataTable
              entriesPerPage={true}
              showTotalEntries={true}
              table={{
                rows: pageData.subscription,
                columns,
              }}
              pagination={{ variant: "outlined", color: "primary" }}
              isSorted={true}
              noEndBorder={false}
            />
          </MDBox>
        )}
        {!UtilMethods.isProvider() && (
          <div>
            <MDTypography variant="h6" mb={2}>
              {t("collection")}
            </MDTypography>
            <DataTable
                entriesPerPage={true}
                showTotalEntries={true}
              table={{
                rows: pageData.collection,
                columns,
              }}
              pagination={{ variant: "outlined", color: "primary" }}
              isSorted={true}
              noEndBorder={false}
            />
          </div>
        )}
      </MDBox>
    ) : null;
  } else {
    return <NoData />;
  }
};

export default DashboardBusinessGoal;
