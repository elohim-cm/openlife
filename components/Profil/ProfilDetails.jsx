import React, { useCallback, useEffect, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Container,
    Tabs,
    Tab,
    Divider,
    Grid,
    Stack,
    Typography
} from "@mui/material";

import { useRouter } from "next/navigation";
import { useAppContext } from "@/contexts/appContext";
import { getToken } from "@/utils";
import Profil from "@/services/Profil";
import ProfilSkeleton from "@/components/Profil/ProfilSkeleton";
import TwoFactorSettings from "@/components/Profil/TwoFactorSettings";

import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import GroupsIcon from "@mui/icons-material/Groups";
import PublicIcon from "@mui/icons-material/Public";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SecurityIcon from "@mui/icons-material/Security";

import moment from "moment";
import "moment/locale/fr";

import AuthService from "@/services/AuthService";
import { ACCOUNT_UPDATE_PAGE } from "@/utils/routes/routes";

import { useTranslation } from "react-i18next";

export default function ProfilDetails() {

    const { t } = useTranslation();

    const [user, setUser] = useState(null);
    const [inProgress, setInProgress] = useState(false);
    const [uuid, setUuid] = useState();
    const [activeTab, setActiveTab] = useState(0);

    const router = useRouter();
    const context = useAppContext();

    moment.locale("fr");

    const token = getToken();

    const getUser = useCallback(async () => {

        try {

            setInProgress(true);

            const result = await Profil.me(token, router);

            setUser(result.data);
            setUuid(result.data.uid);

        } catch (e) {

            AuthService.formatFetchErrorMsgAndLogout(e.message, context, router);

        } finally {

            setInProgress(false);

        }

    }, [token, router]);

    useEffect(() => {

        getUser();

    }, [getUser]);

    const activeAccess = user?.active_access;
    const activeAccessLabel = typeof activeAccess === "string"
        ? activeAccess
        : activeAccess?.role_label || activeAccess?.role?.label || "-";

    const accesses = Array.isArray(user?.accesses) ? user.accesses : [];
    const getAccessLabel = access => typeof access === "string"
        ? access
        : access?.role_label || access?.role?.label || access?.role?.ROL_LIBELLE || access?.role_code || "-";

    const responsibilities = user?.responsibilities || {};

    const networks = responsibilities?.networks || [];
    const distributionAreas = responsibilities?.distribution_areas || [];
    const animationTeams = responsibilities?.animation_teams || [];

    const provider = user?.provider || null;


    const InfoItem = ({ icon: Icon, label, value }) => (

        <Stack direction="row" spacing={2} alignItems="flex-start">

            <Box
                sx={{
                    background: "#f1f5f9",
                    p: 1,
                    borderRadius: 2
                }}
            >
                <Icon sx={{ color: "primary.main" }} />
            </Box>

            <Stack>

                <Typography
                    variant="caption"
                    sx={{
                        textTransform: "uppercase",
                        fontWeight: 600,
                        letterSpacing: 1,
                        color: "text.secondary"
                    }}
                >
                    {label}
                </Typography>

                <Typography fontWeight={500}>
                    {value || "-"}
                </Typography>

            </Stack>

        </Stack>

    );


    return (

        <Container>

            {inProgress && <ProfilSkeleton />}

            {user && !inProgress && (

                <Box>

                    <Tabs
                        value={activeTab}
                        onChange={(_, value) => setActiveTab(value)}
                        sx={{ mb: 3 }}
                    >
                        <Tab label={t("information")} />
                        <Tab icon={<SecurityIcon />} iconPosition="start" label={t("security")} />
                    </Tabs>

                    {activeTab === 0 && (
                        <>
                    {/* PROFILE CARD */}

                    <Card
                        sx={{
                            mb: 4,
                            borderRadius: 4,
                            overflow: "hidden",
                            boxShadow: "0 10px 35px rgba(0,0,0,0.08)"
                        }}
                    >

                        {/* HEADER */}

                        <Box
                            sx={{
                                height: 120,
                                background: "var(--primary)"
                            }}
                        />

                        <CardContent sx={{ mt: -8 }}>

                            <Stack
                                direction={{ xs: "column", md: "row" }}
                                spacing={4}
                                alignItems={{ xs: "center", md: "flex-start" }}
                            >

                                <Avatar
                                    src={user?.image || undefined}
                                    sx={{
                                        width: 130,
                                        height: 130,
                                        border: "4px solid white",
                                        boxShadow: "0 5px 20px rgba(0,0,0,0.2)"
                                    }}
                                >
                                    <PersonIcon sx={{ fontSize: 70 }} />
                                </Avatar>

                                <Box flex={1}>

                                    <Typography variant="h4" fontWeight={700}>
                                        {user?.first_name} {user?.last_name}
                                    </Typography>

                                    <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">

                                        <Chip
                                            label={activeAccessLabel}
                                            color="primary"
                                            sx={{ fontWeight: 600 }}
                                        />

                                        {provider?.code && (
                                            <Chip
                                                label={provider.code}
                                                variant="outlined"
                                                color="secondary"
                                            />
                                        )}

                                    </Stack>

                                    <Divider sx={{ my: 3 }} />

                                    <Grid container spacing={3}>

                                        <Grid item xs={12} sm={6}>
                                            <InfoItem icon={EmailIcon} label={t("email")} value={user?.email} />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <InfoItem icon={PhoneIcon} label={t("phone")} value={user?.phone} />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <InfoItem icon={BadgeIcon} label={t("status")} value={user?.statut} />
                                        </Grid>

                                        <Grid item xs={12} sm={6}>
                                            <InfoItem icon={LocationOnIcon} label={t("address")} value={provider?.address} />
                                        </Grid>

                                    </Grid>

                                </Box>

                            </Stack>

                        </CardContent>

                        <CardActions sx={{ justifyContent: "flex-end", p: 3 }}>

                            <Button
                                variant="contained"
                                size="large"
                                sx={{
                                    borderRadius: 3,
                                    px: 4,
                                    fontWeight: 600,
                                    textTransform: "none"
                                }}
                                onClick={() => {
                                    context.togglePageLoading(true);
                                    router.push(ACCOUNT_UPDATE_PAGE(uuid));
                                }}
                            >
                                {t("update")}
                            </Button>

                        </CardActions>

                    </Card>


                    {/* ACCESS CARD */}

                    <Card sx={{ mb: 4, borderRadius: 3 }}>

                        <CardContent>

                            <Typography
                                variant="h6"
                                fontWeight={700}
                                sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
                            >
                                <GroupsIcon /> {t("activeAccess")}
                            </Typography>

                            <Stack direction="row" spacing={1} flexWrap="wrap" mb={3}>

                                <Chip
                                    label={activeAccessLabel}
                                    color="primary"
                                />

                            </Stack>

                            {accesses.length > 0 && (

                                <Stack direction="row" spacing={1} flexWrap="wrap">

                                    {accesses.map((acc, index) => (

                                        <Chip
                                            key={acc?.uid || acc?.access_uid || `${getAccessLabel(acc)}-${index}`}
                                            label={getAccessLabel(acc)}
                                            variant="outlined"
                                        />

                                    ))}

                                </Stack>

                            )}

                        </CardContent>

                    </Card>


                    {/* RESPONSIBILITIES */}

                    {(networks.length > 0 || distributionAreas.length > 0 || animationTeams.length > 0) && (

                        <Card sx={{ borderRadius: 3 }}>

                            <CardContent>

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
                                >
                                    <LocationOnIcon /> {t("responsibilities")}
                                </Typography>

                                <Grid container spacing={3}>

                                    {[...networks, ...distributionAreas, ...animationTeams].map((item) => (

                                        <Grid item xs={12} sm={6} md={4} key={item.responsabilite_uid}>

                                            <Card
                                                sx={{
                                                    borderRadius: 3,
                                                    transition: "all 0.25s",
                                                    height: "100%",
                                                    boxShadow: 'none',
                                                    "&:hover": {
                                                        transform: "translateY(-5px)",
                                                    }
                                                }}
                                            >

                                                <CardContent>

                                                    <Stack spacing={1}>

                                                        <Typography fontWeight={600}>
                                                            {item.name}
                                                        </Typography>

                                                        <Typography variant="body2" color="text.secondary">
                                                            {t("code")} : {item.code}
                                                        </Typography>

                                                        <Typography variant="body2">
                                                            {t("responsible")} :
                                                            {" "}
                                                            {t(`roles.${item.role_code?.toLowerCase()}`)}
                                                        </Typography>

                                                    </Stack>

                                                </CardContent>

                                            </Card>

                                        </Grid>

                                    ))}

                                </Grid>

                            </CardContent>

                        </Card>

                    )}
                        </>
                    )}

                    {activeTab === 1 && <TwoFactorSettings />}

                </Box>

            )}

        </Container>

    );

}