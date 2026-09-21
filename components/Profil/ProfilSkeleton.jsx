import React from "react";
import {
    Box,
    Card,
    CardContent,
    Grid,
    Skeleton,
    Stack,
} from "@mui/material";

const InfoSkeleton = () => (
    <Stack direction="row" spacing={2} alignItems="flex-start">
        <Skeleton variant="rounded" width={40} height={40} />
        <Stack spacing={0.5} flex={1}>
            <Skeleton variant="text" width="35%" />
            <Skeleton variant="text" width="70%" />
        </Stack>
    </Stack>
);

export default function ProfilSkeleton() {
    return (
        <Box>
            <Skeleton variant="rounded" height={48} sx={{mb: 3}} />

            <Card sx={{mb: 4, borderRadius: 4, overflow: "hidden"}}>
                <Skeleton variant="rectangular" height={120} />
                <CardContent sx={{mt: -8}}>
                    <Stack direction={{xs: "column", md: "row"}} spacing={4} alignItems={{xs: "center", md: "flex-start"}}>
                        <Skeleton variant="circular" width={130} height={130} sx={{flexShrink: 0}} />
                        <Stack spacing={1.5} flex={1} width="100%">
                            <Skeleton variant="text" width="45%" height={44} />
                            <Skeleton variant="rounded" width={150} height={32} />
                            <Skeleton variant="rectangular" height={1} sx={{my: 1}} />
                            <Grid container spacing={3}>
                                {[1, 2, 3, 4].map(item => (
                                    <Grid item xs={12} sm={6} key={item}>
                                        <InfoSkeleton />
                                    </Grid>
                                ))}
                            </Grid>
                        </Stack>
                    </Stack>
                </CardContent>
                <CardContent sx={{display: "flex", justifyContent: "flex-end"}}>
                    <Skeleton variant="rounded" width={130} height={42} />
                </CardContent>
            </Card>

            <Card sx={{mb: 4, borderRadius: 3}}>
                <CardContent>
                    <Skeleton variant="text" width="30%" height={32} />
                    <Stack direction="row" spacing={1} sx={{mt: 2}}>
                        <Skeleton variant="rounded" width={120} height={32} />
                        <Skeleton variant="rounded" width={150} height={32} />
                        <Skeleton variant="rounded" width={100} height={32} />
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}
