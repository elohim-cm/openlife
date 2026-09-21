import React, {useCallback, useEffect, useState} from "react";
import {getToken, getUid} from "@/utils";
import {useRouter} from "next/navigation";
import {useAppContext} from "@/contexts/appContext";
import {Box, Button, Typography} from "@mui/material";
import {LOGIN_PAGE} from "@/utils/routes/routes";
import Toast from "@/utils/toast";
import ActivityIndicator from "@/components/ActivityIndicator";
import BusinessGoal from "@/services/BusinessGoal";
import Card from "@mui/material/Card";
import moment from "moment";
import Divider from "@mui/material/Divider";
import textLabels from "@/utils/mui-data-tables/mui-data-tables-text-labels";
import MUIDataTable from "mui-datatables";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Grid from "@mui/material/Grid";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import AuthService from "@/services/AuthService";
import authService from "@/services/AuthService";
import {formatBussinessLabel, formatDated} from "@/components/BusinessGoal/BusinessGoalListing";
import {useTranslation} from "react-i18next";
import InfoItem from "@/components/souscription/details/InfoItem";

const BusinessGoalRead = () => {
    const {t} = useTranslation();
  const [businessGoal, setBusinessGoal] = useState([]);
  const [inProgress, setInProgress] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsvisible] = useState(false);
  const router = useRouter();
  const token = getToken();
  const context = useAppContext();

  const getBusinessGoal = useCallback(async () => {
    try {
      setInProgress(true);
      const {data, message} = await BusinessGoal.show(token, getUid());
      // Toast.success(message)
      setBusinessGoal(data);
    } catch (e) {
      AuthService.formatFetchErrorMsgAndLogout(e.message, context, router);
    } finally {
      setInProgress(false);
    }
  }, [token, router]);

  useEffect(() => {
    context.togglePageLoading(true);
    getBusinessGoal();
    context.togglePageLoading(false);
  }, [getBusinessGoal, token]);

  return (
    <>
      {businessGoal.length === 0 && !inProgress ? (
        <Box>{t("loading")}</Box>
      ) : (
        <Box sx={{mt: 2, mb: 2}}>
          <ActivityIndicator visible={inProgress} />
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            color="secondary"
            onClick={e => {
              context.togglePageLoading(true);
              router.back();
            }}
            sx={{mb: 2}}>
              {t("return")}
          </Button>
          <Card>
            <Box sx={{p: 2}}>
              <Grid container>
                  <Grid px={2} xs={12} md={6} lg={6} xl={6} className="__item-separator">
                      <Typography variant="h5" style={{margin: "20px 0"}}>
                          {t("businessGoalDetails")}
                      </Typography>
                      <InfoItem
                          label={t("valeur")}
                          value= {businessGoal.value}
                          second={{
                              label: `${t("nature")}`,
                              value: businessGoal.nature,
                          }}
                      />
                      <InfoItem
                          label={t("description")}
                          value= {businessGoal.description || ""}
                          second={{
                              label: `${t("startDate")}`,
                              value: formatDated(businessGoal.begin_date),
                          }}
                      />
                      <InfoItem
                          label={t("endDate")}
                          value={formatDated(businessGoal.end_date)}
                      />
                      <InfoItem
                          label={t("createdAt")}
                          value= {formatDate(businessGoal.created_at)}
                          second={{
                              label: `${t("updatedAt")}`,
                              value: formatDate(businessGoal.updated_at),
                          }}
                      />
                  </Grid>
                  <Grid px={2} xs={12} md={6} lg={6} xl={6} >
                      <Typography variant="h5" style={{margin: "20px 0"}}>
                          {t("targetDetails")}
                      </Typography>
                        <InfoItem
                            label={t("name")}
                            value= {businessGoal.target?.name}
                            second={{
                                label: `${t("code")}`,
                                value: businessGoal.target?.code,
                            }}
                        />
                        <InfoItem
                            label={t("description")}
                            value= {businessGoal.target?.description || ""}
                            second={{
                                label: `${t("responsible")}`,
                                value: `${businessGoal.target?.inspector?.last_name || ""} ${businessGoal.target?.inspector?.first_name || ""}`,
                            }}
                        />
                    </Grid>
              </Grid>
              <Divider />
              <Button variant="contained" onClick={() => setIsvisible(prev => !prev)}>{`${
                isVisible ? t("closeHistory") : t("viewModificationHistory")
              }`}</Button>
              {isVisible && <HistoriqueModifications uuid={getUid()} token={token} context={context} router={router} />}
            </Box>
          </Card>
        </Box>
      )}
    </>
  );
};

const TargetDetails = ({target}) => {
    const {t} = useTranslation();
  return (
    <Box>
      <Typography variant="h5" style={{margin: "20px 0"}}>
          {t("targetDetails")}
      </Typography>
      <Typography variant="body2">
        <strong>{t("name")}:</strong> {target?.name}
      </Typography>
      <Typography variant="body2">
        <strong>{t("code")}:</strong> {target?.code}
      </Typography>
      <Typography variant="body2">
        <strong>{t("description")}:</strong> {target?.description || "N/A"}
      </Typography>
      <Typography variant="body2">
        <strong>{t("responsible")} :</strong> {target?.inspector?.last_name || ""} {target?.inspector?.first_name || ""}
      </Typography>
    </Box>
  );
};

const HistoriqueModifications = ({uuid, token, context, router}) => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [datas, setDatas] = useState(undefined);
  const [pagination, setPagination] = useState(undefined);
    const {t} = useTranslation();

  const getHistories = useCallback(
    async (page, query) => {
      try {
        const {data: result} = await BusinessGoal.histories(token, uuid, page, query);
        setDatas(result.datas);
        setPagination(result.pagination);
      } catch (e) {
        authService.formatFetchErrorMsgAndLogout(e.message, context, router)
      }
    },
    [uuid, token],
  );

  useEffect(() => {
    getHistories(page, query);
  }, [getHistories, uuid, page, query]);


    const columns =[
        {name: "business_goals", label: t("businessGoalValue")},
        {name: "account", label: t("account")},
        {name: "created_at", label: t("creationDate")},
        {name: "updated_at", label: t("updateDate")},
    ]
    const tableData = () => {
        return datas?.map(data => {
            const { business_goals, access, created_at, updated_at } = data || {};
            const lastName = access?.account?.last_name || '';
            const firstName = access?.account?.first_name || '';
            const role =access?.role.label || '';

            console.log(access?.role.label)
            return {
                business_goals: String(formatBussinessLabel(business_goals?.target?.code, business_goals?.nature, business_goals?.value, business_goals?.end_date)),
                account: `${String(lastName)} ${String(firstName)} (${role}) `,
                created_at: formatDate(created_at),
                updated_at: formatDate(updated_at),
            };
        }) || [];
    };

    return (
        <Box>
            <Typography variant="h5" style={{margin:"20px 0"}}>{t("modificationHistory")}</Typography>
            {
                datas === undefined ?
                    <TableSkeleton rowsNumber={4} />
                :
                    <MUIDataTable
                        title={t("modificationHistoryListing")}
                        className="brMd"
                        options={{
                            onSearchChange: async (q) => {
                                setPage(1)
                                setQuery(String(q || '').trim())
                            },
                            setTableProps: () => {
                                return {
                                    size: "medium",
                                };
                            },
                            elevation: 1,
                            serverSide: true,
                            onChangePage: async currentPage => setPage(currentPage + 1),
                            rowsPerPage: pagination.per_page ? pagination.per_page : 10,
                            count: pagination.total ? pagination.total : null,
                            textLabels,
                        }}
                        columns={columns}
                        data={tableData()}
                    />
            }

        </Box>
    );
};

const formatDate = dateString => {
  return dateString ? moment(dateString).format("DD/MM/YYYY HH:mm:ss") : "N/A";
};

export default BusinessGoalRead;
