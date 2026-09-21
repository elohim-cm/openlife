"use client";
import {useAppContext} from "@/contexts/appContext";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {formatNumber, getStatusBadge, getToken, getUid} from "@/utils";
import {useRouter} from "next/navigation";
import SubscriptionService from "@/services/SubscriptionService";
import {displayHttpError} from "@/utils/api";
import Routes from "@/utils/routes";
import contractService from "@/services/ContractService";
import SousDetailsComponent from "@/components/souscription/details";
import MDBox from "@/material/components/MDBox";
import MDTypography from "@/material/components/MDTypography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {Box, Button, ButtonGroup, Stack, Tooltip} from "@mui/material";
import AuthService from "@/services/AuthService";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import * as PropTypes from "prop-types";
import TableHistories from "@/components/Contract/TableHistories";
import Grid from "@mui/material/Unstable_Grid2";
import InfoItem from "@/components/souscription/details/InfoItem";
import Link from "next/link";
import UtilMethods from "@/utils/UtilMethods";
import {useTranslation} from "react-i18next";
import Toast from "@/utils/toast";
import {CONTRACT_UPDATE} from "@/utils/routes/routes";
import EditIcon from "@mui/icons-material/Edit";
import styles from "@/styles/accountListing.module.scss";
import {TbStatusChange} from "react-icons/tb";
import Dialog from "@mui/material/Dialog";
import ActivityIndicator from "@/components/ActivityIndicator";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";
import ProviderService from "@/services/ProviderService";
import ContractService from "@/services/ContractService";
import {Controller, useForm} from "react-hook-form";
import selectProviderSchema from "@/components/Contract/schemas/selectProviderSchema";
import {zodResolver} from "@hookform/resolvers/zod";
import Constants from "@/utils/constants";
import ConfirmModal from "@/components/ConfirmModal";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import BuyBackService from "@/services/BuyBackService";
import textLabels from "@/utils/mui-data-tables/mui-data-tables-text-labels";
import MUIDataTable from "mui-datatables";
import TableUtils from "@/utils/table";
import RedemptionTable from "@/components/RedemptionTable";
import {columns, handleActiveFilter, tableData} from "@/components/buyback/BuyBackList";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TabPanel from "@/components/TabPanel";
import ContractRedemption from "@/components/Contract/ContractRedemption";
import ContractCollection from "@/components/Contract/ContractCollection";

const tableUtils = new TableUtils();

TableHistories.propTypes = {histories: PropTypes.any};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}

function CloneProps(props) {
  const {children, ...other} = props;
  return children(other);
}

const ContractShowPage = () => {
  const {t} = useTranslation();
  const [record, setRecord] = React.useState(undefined);
  const [currentTab, setCurrentTab] = React.useState(0);
  const token = getToken();
  const context = useAppContext();
  const router = useRouter();
  const [tableTitle, setTableTitle] = useState(t("allRedemptions"));

  const [isShow, setIsShow] = useState(false);
  const [isShowList, setIsShowList] = useState(false);
  const [providers, setProviders] = useState(null);
  const [inProgress, setInProgress] = useState(false);
  const [histories, setHistories] = useState(undefined);
  const [pagination, setPagination] = useState(undefined);
  const [redemptions, setRedemptions] = useState(undefined);
  const [_pagination, set_Pagination] = useState(undefined);
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
  const [openDialog, setOpenDialog] = React.useState(false);
  const [ready, setReady] = useState(false);
  const [activeButtonIndex, setActiveButtonIndex] = useState(1);
  const [statut, setStatut] = useState("");
  const [qProvider, setqProvider] = useState("");
  const [tabOrientation, setTabOrientation] = useState("vertical");

  const param = UtilMethods.getStatusParam();
  const authRedemptionModal = useRef();

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const actionButtonLabels = [
    {id: 1, label: t("all"), status: "", tableTitle: t("allRedemptions")},
    {id: 2, label: t("inConfirmation"), status: "confirmation", tableTitle: t("inConfirmationRedemptions")},
    {id: 3, label: t("inAcceptance"), status: "acceptance", tableTitle: t("redemptionsInAcceptance")},
    {id: 4, label: t("inApproval"), status: "approval", tableTitle: t("redemptionsInApproval")},
    {id: 5, label: t("inValidation"), status: "validation", tableTitle: t("redemptionsInValidation")},
    {id: 6, label: t("inPayment"), status: "payment", tableTitle: t("redemptionsInPayment")},
    {id: 7, label: t("rejected"), status: "rejected", tableTitle: t("redemptionsRejected")},
  ];

  const handleWindowResize = () => {
    if (window.innerWidth <= 920) {
      setTabOrientation("horizontal");
    } else {
      setTabOrientation("vertical");
    }
  };

  useEffect(() => {
    context.togglePageLoading();
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [context]);

  const [currentPage, setCurrentPage] = useState(1);
  const [_currentPage, set_CurrentPage] = useState(1);

  const getRecord = async _uid => {
    const result = await contractService.getOne(token, _uid);
    if (!result.error) {
      setRecord(result.contract);
    } else {
      displayHttpError(result.error, router);
    }
  };

  React.useEffect(() => {
    if (token == null || token === "") router.push(Routes.LOGIN);
    const uuid = getUid();
    getRecord(uuid);
  }, [router, token]);

  // request all providers
  const getProviders = useCallback(
    async (page, _qProvider) => {
      if (UtilMethods.getHabilitations(authorizations, "contract").canReassign) {
        const response = await ProviderService.getAll(token, page, "", _qProvider);
        console.log("get providers -- contract list ||| ", response);

        // if no errors
        if (response.error === null) {
          setProviders(response.providers);
        } else {
          displayHttpError(response.error, router);
        }
      }
    },
    [token, router, qProvider],
  );

  useEffect(() => {
    if (UtilMethods.getHabilitations(authorizations, "contract").canReassign) {
      getProviders(1, qProvider);
    }
  }, [getProviders, qProvider]);

  const handleLoadHistoryContract = async () => {
    try {
      setIsShow(prev => !prev);
    } catch (e) {
      AuthService.formatFetchErrorMsgAndLogout(e.message, context, router);
    }
  };

  // validation schema
  const {
    formState: {errors, isSubmitting, isValid},
    control,
    handleSubmit,
    getValues,
  } = useForm({
    resolver: zodResolver(selectProviderSchema),
    defaultValues: {provider: null},
    mode: "all",
  });
  const handleDownloadContract = async _uid => {
    context.togglePageLoading(true);
    if (!inProgress) {
      setInProgress(true);
      const result = await contractService.download(token, _uid);
      setInProgress(false);
      if (result.error == null) {
        Toast.success(t("contractDownloadSuccessfully"));
      } else {
        displayHttpError(result.error, router);
      }
    }
    context.togglePageLoading(false);
  };
  const handleDownloadAmendment = async _uid => {
    context.togglePageLoading(true);
    if (!inProgress) {
      setInProgress(true);
      const result = await contractService.downloadAmendment(token, _uid);
      setInProgress(false);
      if (result.error == null) {
        Toast.success(t("amendmentDownloadSuccessfully"));
      } else {
        displayHttpError(result.error, router);
      }
    }
    context.togglePageLoading(false);
  };

  useEffect(() => {
    if (isShow) {
      const uuid = getUid();
      const fetchData = async () => {
        try {
          const {history, pagination} = await contractService.getHistories(token, uuid, currentPage);
          setHistories(history);
          setPagination(pagination);
        } catch (e) {
          AuthService.formatFetchErrorMsgAndLogout(e.message, context, router);
        }
      };
      fetchData();
    }
  }, [isShow, token, currentPage, context, router]);

  const getRedemptions = useCallback(async (_uuid, _statut) => {
    const result = await contractService.redemptions(token, _uuid, _currentPage, _statut);
    if (result.error == null) {
      setRedemptions(result.datas);
      set_Pagination(result.pagination);
      setReady(true);
    } else {
      displayHttpError(result.error, router);
    }
  }, []);
  useEffect(() => {
    if (isShowList) {
      const uuid = getUid();
      getRedemptions(uuid, statut);
    }
  }, [isShowList, token, _currentPage, context, router, statut]);

  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  // handle contract activation
  const handleAffectContract = async () => {
    setInProgress(true);
    const affectContract = [];
    const {provider} = getValues();
    let data = {};

    affectContract.push(getUid());
    // normalize data
    data = {contracts: affectContract};

    const response = await ContractService.affect(token, provider?.uid, data);

    if (response.error === null) {
      Toast.success(t("contractSuccessfullyAssigned"));
      setOpenDialog(false);
      setInProgress(false);
    } else {
      Toast.show(t("assignmentFailed"), 3000, "error");
      setOpenDialog(false);
      setInProgress(false);
    }
  };

  const handleAuthorizeRedemption = async () => {
    authRedemptionModal.current?.toggleLoader(true);
    const result = await contractService.redemption(token, getUid());
    authRedemptionModal.current?.toggleLoader(false);
    if (result.error == null) {
      Toast.success(t("requestCompletedSuccessfully"));
      authRedemptionModal.current?.close();
    } else {
      displayHttpError(result.error, router);
    }
  };

  // filter buybacks
  const handleActiveFilter = (index, status) => {
    setActiveButtonIndex(index);
    setStatut(status);
    if (status !== "") {
      setTableTitle(actionButtonLabels.find(actionButton => actionButton.id === index).tableTitle);
    } else {
      setTableTitle(t("allRedemptions"));
    }
  };
  useEffect(() => {
    if (param !== null) {
      setStatut(param);

      const matchingButton = actionButtonLabels.find(action => action.status === param);
      const indexTable = matchingButton?.id || 1;

      handleActiveFilter(indexTable, param);
    }
  }, []); 


  return (
    <Box mt={1} className="__details-tabs">
      <Tabs
        orientation={tabOrientation}
        value={currentTab}
        onChange={handleTabChange}
        sx={{borderColor: "divider", backgroundColor: "transparent"}}>
        <Tab label={t("details")} {...a11yProps(0)} />
        <CloneProps>
          {tabProps => (
            <Tooltip title={!UtilMethods.isAuthorizeToReadInContract()? t("youAreNotAuthorized") : null} arrow>
              <div>
                <Tab {...tabProps} label={t("collections")} disabled={!UtilMethods.isAuthorizeToReadInContract()} {...a11yProps(0)} />
              </div>
            </Tooltip>
          )}
        </CloneProps>
        <CloneProps>
          {tabProps => (
            <Tooltip title={!UtilMethods.isAuthorizeToReadInContract() ? t("youAreNotAuthorized") : null} arrow>
              <div>
                <Tab {...tabProps} label={t("redemptions")} disabled={!UtilMethods.isAuthorizeToReadInContract()} {...a11yProps(0)} />
              </div>
            </Tooltip>
          )}
        </CloneProps>
      </Tabs>
      <TabPanel value={currentTab} index={0}>
        <MDBox sx={{width: "100%", px: 2}}>
          <MDBox sx={{display: "flex", alignItems: "center", my: 2}} mb={2}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              color="secondary"
              onClick={e => {
                context.togglePageLoading(true);
                router.back();
              }}>
              {t("back")}
            </Button>
            <ButtonGroup style={{marginLeft: "16px"}} variant="contained">
              {record !== undefined && UtilMethods.getHabilitations(authorizations, "contract").canDownload && (
                <Button disabled={inProgress} color="secondary" onClick={() => handleDownloadContract(record.uid)}>
                  {t("downloadThisContract")}
                </Button>
              )}
            </ButtonGroup>
            {(UtilMethods.getHabilitations(authorizations, "contract").canUpdate ||
              UtilMethods.getHabilitations(authorizations, "contract").canAmendment) && (
              <Tooltip title={t("update")} placement="bottom">
                <Button
                  style={{margin: " 0 8px"}}
                  variant="contained"
                  color="primary"
                  component="a"
                  href={CONTRACT_UPDATE(getUid())}
                  onClick={e => context.togglePageLoading(true)}>
                  {t("updateContract")}
                </Button>
              </Tooltip>
            )}
            {UtilMethods.getHabilitations(authorizations, "contract").canReassign && (
              <Button
                variant="contained"
                onClick={handleClickOpen}
                color="secondary"
                starticon={<TbStatusChange styles={{color: "#fff"}} />}
                className="secondary-action-button no-text-tranform">
                {t("affectThisContract")}
              </Button>
            )}
            {record &&
              record.status !== Constants.STATUS_CONTRACT.suspended &&
              record.status !== Constants.STATUS_CONTRACT.fence &&
              UtilMethods.isCustomerService() && (
                <Button
                  style={{margin: " 0 8px"}}
                  variant="contained"
                  onClick={() => authRedemptionModal.current?.open()}
                  color="secondary"
                  starticon={<TbStatusChange styles={{color: "#fff"}} />}
                  className="secondary-action-button no-text-tranform">
                  {t("authorizeAnExceptionalRedemption")}
                </Button>
              )}
          </MDBox>
          <MDTypography variant="h6" mb={1}>
            {t("contractInformation")}
          </MDTypography>

          {record !== undefined ? (
            <>
              <MDBox bgColor="white" className="__box" mb={2}>
                <Grid container spacing={2}>
                  <Grid xs={12} md={6} lg={6} xl={6} className="__item-separator">
                    <InfoItem
                      label={t("contractCode")}
                      value={record.code}
                      second={{
                        label: `${t("status")}`,
                        value: getStatusBadge(record.status, t, false, true),
                      }}
                    />
                    <InfoItem
                      label={t("durationInYears")}
                      value={record.duration}
                      second={{
                        label: `${t("premium")}`,
                        value: formatNumber(record.prime),
                      }}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={6} xl={6}>
                    <InfoItem
                      label={t("contributor")}
                      value={`${record.subscription?.provider?.last_name || ""} ${
                        record.subscription?.provider?.first_name || ""
                      }`}
                      second={{
                        label: `${t("subscriber")}`,
                        value: `${record.subscription?.subscribers[0]?.person.last_name || ""} ${
                          record.subscription?.subscribers[0]?.person.first_name || ""
                        }`,
                      }}
                    />
                    <InfoItem
                      label={t("effectiveDate")}
                      value={record.effective_date}
                      second={{
                        label: `${t("dueDate")}`,
                        value: record.due_date,
                      }}
                    />
                  </Grid>
                </Grid>
              </MDBox>
              {UtilMethods.getHabilitations(authorizations, "subscription").canRead && (
                <Link href={Routes.SOUSCRIPTION_DETAILS(record.subscription.uid)}>
                  <Button variant="contained" color="primary" onClick={() => context.togglePageLoading(true)}>
                    {t("openSubscription")}
                  </Button>
                </Link>
              )}
              <SousDetailsComponent uid={record.subscription?.uid} data={record.subscription} />
            </>
          ) : (
            <Box sx={{mt: 2, mb: 2}}>
              <Card>
                <Box sx={{p: 2}}>
                  {/*{new Array(6).map((_, i)=> <Skeleton key={i} animation="wave" />)}*/}
                  <Skeleton animation="wave" />
                  <Skeleton animation="wave" />
                  <Skeleton animation="wave" />
                </Box>
              </Card>
            </Box>
          )}
          <MDBox mt={2} mb={2}>
            <Button variant="contained" color="primary" onClick={handleLoadHistoryContract} sx={{mb: 2}}>
              {`${isShow ? t("closeContractHistory") : t("consultContractHistory")} `}
            </Button>
          </MDBox>
          {isShow && (
            <MDBox>
              {histories === undefined ? (
                <TableSkeleton rowsNumber={4} />
              ) : (
                <TableHistories
                  contractUid={record.uid}
                  histories={histories}
                  pagination={pagination}
                  setCurrentPage={setCurrentPage}
                  onHandleDownloadContract={handleDownloadAmendment}
                />
              )}
            </MDBox>
          )}
          {UtilMethods.isProvider() && (
            <MDBox mt={2} mb={2}>
              <Button variant="outlined" color="primary" onClick={() => setIsShowList(prev => !prev)} sx={{mb: 2}}>
                {`${isShowList ? t("closeRedemptionListing") : t("consultRedemptionListing")} `}
              </Button>
            </MDBox>
          )}
          {isShowList && (
            <MDBox>
              {redemptions === undefined ? (
                <TableSkeleton rowsNumber={4} />
              ) : (
                <RedemptionTable
                  buybacks={redemptions}
                  columns={columns(t)}
                  tableTitle={tableTitle}
                  tableUtils={tableUtils}
                  context={context}
                  downloadRef={null}
                  pagination={_pagination}
                  setBuybacks={setRedemptions}
                  getBuybacks={getRedemptions}
                  tableData={tableData(t, authorizations, context)}
                  ready={ready}
                  actionButtonLabels={actionButtonLabels}
                  activeButtonIndex={activeButtonIndex}
                  handleActiveFilter={handleActiveFilter}
                />
              )}
            </MDBox>
          )}
          {UtilMethods.getHabilitations(authorizations, "contract").canReassign && (
            <Dialog open={openDialog} onClose={handleClose}>
              <ActivityIndicator visible={inProgress} />
              <DialogTitle>{t("chooseContributor")}</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  {t("chooseContributorToAssign")} {t("thisContract")}
                </DialogContentText>
                <Controller
                  name="provider"
                  control={control}
                  render={({field: {onChange, value}}) => (
                    <Autocomplete
                      id="provider"
                      onChange={(_, item) => {
                        onChange(item);
                      }}
                      value={value}
                      onInputChange={(event, newInputValue) => {
                        console.log(newInputValue.trim());
                        setqProvider(newInputValue.trim());
                      }}
                      options={providers ?? []}
                      getOptionLabel={option => `${option.last_name || ""} ${option.first_name || ""}`}
                      isOptionEqualToValue={(option, value) => option.uid === value.uid}
                      fullWidth
                      disabled={isSubmitting}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label={`${t("chooseContributorAgain")}*`}
                          variant="filled"
                          helperText={errors.provider?.message}
                          error={!!errors.provider}
                        />
                      )}
                    />
                  )}
                />
              </DialogContent>
              <DialogActions>
                <Button variant="outlined" color="error" onClick={handleClose}>
                  {t("cancel")}
                </Button>
                <Button variant="contained" disabled={!isValid} onClick={handleAffectContract}>
                  {t("affect")}
                </Button>
              </DialogActions>
            </Dialog>
          )}
          <ConfirmModal
            ref={authRedemptionModal}
            title={t("confirmation")}
            content={t("areYouSureYouWantToAuthorizeAnExceptionalRedemption")}
            onConfirm={handleAuthorizeRedemption}
          />
        </MDBox>
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        <MDBox sx={{width: "100%", px: 2}}>
          <ContractCollection focus={currentTab === 1} contract={record} />
        </MDBox>
      </TabPanel>
      <TabPanel value={currentTab} index={2}>
        <MDBox sx={{width: "100%", px: 2}}>
          <ContractRedemption focus={currentTab === 2} contract={record} />
        </MDBox>
      </TabPanel>
    </Box>
  );
};

export default ContractShowPage;
