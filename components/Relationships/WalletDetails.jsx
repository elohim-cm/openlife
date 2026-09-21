'use client'

import { useTheme } from "@mui/material/styles";
import '/styles/helpers.scss'
import Grid from "@mui/material/Unstable_Grid2";
import {Box, Button, CardActions, CardContent, Paper, Stack, Typography} from "@mui/material";
import {useRouter} from "next/navigation";
import React, {useCallback, useEffect, useState} from "react";
import {useAppContext} from "@/contexts/appContext";
import {getToken, getUid} from "@/utils";
import Profil from "@/services/Profil";
import Toast from "@/utils/toast";
import { useRouter as routerNext } from 'next/router';
import ProfilSkeleton from "@/components/Profil/ProfilSkeleton";
import PersonIcon from "@mui/icons-material/Person";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import moment from "moment/moment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import AuthService from "@/services/AuthService";
import WalletService from "@/services/WalletService";
import MDTypography from "@/material/components/MDTypography";
import Skeleton from "@mui/material/Skeleton";
import MDButton from "@/material/components/MDButton";
import {tableDataContracts, tableDataSouscriptions} from "@/components/Relationships/tableDatas";
import DataTables from "@/components/Relationships/DataTables";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import {useTranslation} from "react-i18next";
import InfoItem from "@/components/souscription/details/InfoItem";
import UtilMethods from "@/utils/UtilMethods";

const WalletDetails = () => {
    const {t} = useTranslation();
    const uid = getUid();
    const [user, setUser] = useState({});
    const [uuid, setUuid] = useState('');
    const [label, setLabel] = useState('');
    const [selectedLibelle, setSelectedLibelle] = useState('');
    const [inProgress, setInProgress] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [person, setPerson] = useState(undefined);
    const { token } = JSON.parse(localStorage.getItem("storedValues")) || {};
    const [resources, setResources] = useState(undefined);
    const [pagination, setPagination] = useState(undefined);
    const [selectedResources, setSelectedResources] = useState(null);
    const context = useAppContext();
    const [qContract, setqContract] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    // theme
    const theme = useTheme();
    const router = useRouter();
    //

    const columns = t => ({
        clients: [
            { name: "code", label: t('ctrNumber') },//
            { name: "code", label: t('code') },
            { name: "prime", label: t('premium') },
            { name: "duration", label: t('durationYears') },
            { name: "status", label: t('status') },
            { name: "date", label: t('date') },
            { name: "actions", label: "Actions", filter: false, sort: false },
        ],
        prospects: [
            { name: "code", label: t('numberSub') },//
            { name: "prime", label: t('premium') },//
            { name: "accessory", label: t('accessory') },//
            { name: "amount", label: t('amount') },//
            { name: "status", label: t('status') },
            { name: "duration", label: t('duration') },
            { name: "subscriber", label: t('subscriber') },
            { name: "provider", label: t('contributor') },
            { name: "actions", label: "Actions", filter: true, sort: true },
        ],
    });

    useEffect(() => {
        if (uid) {
            const queryString = typeof window !== 'undefined' ? window.location.search : '';
            const urlParams = new URLSearchParams(queryString);
            const labelParam = urlParams.get("label");
            
            setUuid(uid);
            setLabel(labelParam || '');
        }
    }, [uid]);
    const types = ['clients', 'prospects']
    const libelles = t => ({
        clients: t("contracts"),
        prospects: t('subscriptions')
    })

    const getPerson = useCallback(async () => {
        try {
            setInProgress(true);

            // Create a mapping of labels to corresponding methods
            const labelMethodMap = {
                clients: WalletService.customer.bind(WalletService),
                prospects: WalletService.prospect.bind(WalletService)
            };

            // Check if the label is valid
            if (labelMethodMap[label]) {
                // Call the corresponding method with the required arguments
                const result = await labelMethodMap[label](token, uuid);
                setPerson(result)
                setSelectedLibelle(libelles(t)[label])
            } else {
                // Handle the case where the label is not valid
            }
        } catch (e) {
            AuthService.formatFetchErrorMsgAndLogout(e.message, context, router);
        } finally {
            setInProgress(false);
        }
    }, [token, uuid, label, context, router]);

    useEffect(() => {
        getPerson()
    }, [getPerson]);

    const handleLoadResources = async (currentPage=1, query='') =>{
        try {
            setIsLoading(true)
            const labelMethodMap = {
                clients: WalletService.contracts.bind(WalletService),
                prospects: WalletService.subscriptions.bind(WalletService)
            };
            const result = await labelMethodMap[label](token, uuid, currentPage, query);
            setResources(result.data)
            setPagination(result.data.pagination)
        }catch (e) {
            AuthService.formatFetchErrorMsgAndLogout(e.message, context, router);
        }finally {
            setIsLoading(false)
        }
    }
    const operatorsTables = {
        clients: tableDataContracts,
        prospects: tableDataSouscriptions
    }
    return (
      <>
          <Stack width="100%" direction="row" spacing={2} sx={{mb: 3}}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                color="secondary"
                onClick={() => {
                    context.togglePageLoading(true);
                    router.back();
                }}
                sx={{mb: 2}}
              >
                  {t('back')}
              </Button>
          </Stack>
          <Paper elevation={3} sx={{borderRadius: 2, padding: "40px 24px", mb: 4, position: "relative"}}>
              {
                  (person === undefined && inProgress) ? <Skeleton width='100%' height='150px' /> :
                    <Grid container spacing={2}>
                        <Grid px={2} xs={12} md={6} lg={6} xl={6} className="__item-separator">
                            <MDTypography variant='h4'>{t('personalDetails')}</MDTypography>
                            <InfoItem
                              label={t("code")}
                              value={`${person?.code}`}
                              second={{
                                  label: `${t("fullName")}`,
                                  value: `${person?.last_name} ${person?.first_name}`,
                              }}
                            />
                            <InfoItem
                              label={t("address")}
                              value= {person?.address}
                              second={{
                                  label: `${t("email")}`,
                                  value: person?.email,
                              }}
                            />
                            <InfoItem
                              label={t("gender")}
                              value= {UtilMethods.gender(t)[person?.gender?.label] || ''}
                              second={{
                                  label: `${t("maritalStatus")}`,
                                  value: person?.marital_status?.label,
                              }}
                            />
                            <InfoItem
                              label={t("birthdate")}
                              value= {person?.birth_date}
                              second={{
                                  label: `${t("birthplace")}`,
                                  value: person?.birth_place,
                              }}
                            />
                            <InfoItem
                              label={t("primaryPhoneNumber")}
                              value= {person?.main_phone}
                              second={{
                                  label: `${t("secondaryPhoneNumber")}`,
                                  value: person?.secondary_phone,
                              }}
                            />
                        </Grid>
                        <Grid px={2} xs={12} md={6} lg={6} xl={6}  className="__item-separator">
                            <MDTypography variant='h4'>{t('identificationDocuments')}</MDTypography>
                            <InfoItem
                              label={t("nationalIDNumber")}
                              value= {person?.cni_number}
                              second={{
                                  label: `${t("nationalIDExpirationDate")}`,
                                  value: person?.cni_expired_at,
                              }}
                            />
                            <InfoItem
                              label={t("uniqueIdentifierNumber")}
                              value= {person?.nui_number}
                            />
                        </Grid>
                        <Grid px={2} xs={12} md={6} lg={6} xl={6}  className="__item-separator">
                            <MDTypography variant='h4'>{t('importantDates')}</MDTypography>
                            <InfoItem
                              label={t("createdAt")}
                              value= {moment(person?.created_at).format("DD/MM/YYYY HH:mm:ss")}
                              second={{
                                  label: `${t("updatedAt")}`,
                                  value: moment(person?.updated_at).format("DD/MM/YYYY HH:mm:ss"),
                              }}
                            />
                        </Grid>
                    </Grid>
              }
              <Box display='flex' justifyContent="flex-end">
                  <Button variant="contained" onClick={() => {
                      setShow(prev => !prev)
                      handleLoadResources(1, '')
                  }}>{show? t('closeMy'): t('consultMy')} {selectedLibelle}</Button>
              </Box>
          </Paper>

          {show && (
            <Box sx={{ borderRadius: 2, my: 4, position: "relative" }}>
                {(isLoading && resources===undefined) ? (
                  <TableSkeleton rowsNumber={5} />
                ) : (
                  <Box>
                      <DataTables
                        type={label}
                        resources={resources}
                        pagination={pagination}
                        isLoading={isLoading}
                        tableTitle={libelles(t)[label]}
                        columns={columns(t)[label]}
                        tableData={operatorsTables[label](resources, context, t)}
                        selectedResources={selectedResources}
                        setSelectedResources={setSelectedResources}
                        onTableChange={async (currentPage, query) => {
                            context.togglePageLoading(true)
                            await handleLoadResources(currentPage + 1, query)
                            context.togglePageLoading(false)
                        }}
                      />
                  </Box>
                )}
            </Box>
          )}

      </>
    );
};
const TextEditor = ({title, text})=>{
    return <Box display='flex'>
        <MDTypography variant='h6'>{title} : </MDTypography>
        <MDTypography variant='body2'>{" "}{text}</MDTypography>
    </Box>
}

export default WalletDetails;