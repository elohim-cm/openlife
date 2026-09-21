"use client";

export const dynamic = 'force-dynamic';

import ProviderUpdate from "@/components/Provider/ProviderUpdate";
import HabilitationGuard from "@/components/Habilitation/HabilitationGuard";

const ProviderUpdatePage = () => {
    return (
        <HabilitationGuard label="provider" permission="canUpdate">
            <ProviderUpdate />
        </HabilitationGuard>
    );
};

export default ProviderUpdatePage;
