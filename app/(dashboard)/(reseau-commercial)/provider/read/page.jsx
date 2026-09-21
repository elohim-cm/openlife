"use client";

export const dynamic = 'force-dynamic';

import ProviderRead from "@/components/Provider/ProviderRead";
import HabilitationGuard from "@/components/Habilitation/HabilitationGuard";

const ProviderReadPage = () => {
    return (
        <HabilitationGuard label="provider" permission="canRead">
            <ProviderRead />
        </HabilitationGuard>
    );
};

export default ProviderReadPage;
