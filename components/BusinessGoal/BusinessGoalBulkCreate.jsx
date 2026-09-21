"use client";

import React, {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button, Paper, Box, Grid, Typography, Alert, Autocomplete, TextField, Divider} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InfoIcon from "@mui/icons-material/Info";
import ActivityIndicator from "@/components/ActivityIndicator";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import {useAppContext} from "@/contexts/appContext";
import {getToken} from "@/utils";
import {BUSINESS_GOAL_LIST} from "@/utils/routes/routes";
import BusinessGoal from "@/services/BusinessGoal";
import AuthService from "@/services/AuthService";
import {useTranslation} from "react-i18next";
import Toast from "@/utils/toast";
import {z} from "zod";
import {formatBussinessLabel} from "@/components/BusinessGoal/BusinessGoalListing";
import TargetSelector from "./BusinessGoalBulkCreate/TargetSelector";
import TargetCard from "./BusinessGoalBulkCreate/TargetCard";
import TargetCardMultiNature from "./BusinessGoalBulkCreate/TargetCardMultiNature";
import GlobalActions from "./BusinessGoalBulkCreate/GlobalActions";
import ErrorAlert from "./BusinessGoalBulkCreate/ErrorAlert";
import { buildBulkCreatePayload, processBulkCreateResults, updateCardsAfterBulkCreate, logBulkCreateResults } from "./BusinessGoalBulkCreate/helpers";

const BusinessGoalBulkCreate = () => {
    const {t} = useTranslation();
    const [inProgress, setInProgress] = useState(false);
    const [inLoading, setInLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [targets, setTargets] = useState([]);
    const [availableTargets, setAvailableTargets] = useState([]);
    const [targetCards, setTargetCards] = useState([]);
    const [_errors, setErrors] = useState([]);
    const [loadingCards, setLoadingCards] = useState(new Set());
    const [userOrganization, setUserOrganization] = useState(null);
    const [parentGoalsByNature, setParentGoalsByNature] = useState({
        subscription: [],
        collection: []
    });
    const [organizationLoaded, setOrganizationLoaded] = useState(false);
    const router = useRouter();
    const context = useAppContext();
    const token = getToken();
    const {authorizations, access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
    const access = accesses?.find(access => access.uid === currentAccess);

    // Schema validation pour le formulaire unique
    const formSchema = z.object({
        type: z.object({name: z.string(), label: z.string()}).nullable().refine(val => val !== null, {
            message: t("typeRequired")
        }),
        description: z.string().optional()
    });

    const {
        formState: {errors: formErrors, isSubmitting: formSubmitting},
        handleSubmit: handleFormSubmit,
        control: formControl,
        watch: formWatch,
        setValue: setFormValue
    } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: null,
            description: ""
        },
        mode: "all",
    });

    const selectedType = formWatch('type');
    const description = formWatch('description');

    // Pré-sélectionner le type s'il n'y a qu'une seule option
    useEffect(() => {
        const types = BusinessGoal.types(t);
        if (types.length === 1 && !selectedType) {
            setFormValue('type', types[0], { shouldValidate: true });
        }
    }, [t, selectedType, setFormValue]);

    // Charger les objectifs de l'entité une seule fois au montage
    useEffect(() => {
        const loadOrganization = async () => {
            try {
                const {data: orgData} = await BusinessGoal.getUserOrganizationWithGoals(token);
                setUserOrganization(orgData.organization);
                
                // Grouper les objectifs par nature
                const goalsByNature = {
                    subscription: orgData.parent_goals.filter(g => g.nature === 'subscription'),
                    collection: orgData.parent_goals.filter(g => g.nature === 'collection')
                };
                setParentGoalsByNature(goalsByNature);
                setOrganizationLoaded(true);
            } catch (orgError) {
                console.error('Error loading organization:', orgError);
                setOrganizationLoaded(true);
            }
        };
        
        loadOrganization();
    }, []);

    // Charger les cibles quand le type change
    useEffect(() => {
        if (!selectedType) {
            setAvailableTargets([]);
            setTargets([]);
            setTargetCards([]);
            return;
        }

        const loadTargets = async () => {
            try {
                setInLoading(true);
                
                // Charger les cibles disponibles
                const {data1} = await BusinessGoal.resources(token, '', '', selectedType.name, '', '');
                const loadedTargets = data1.datas || [];
                setAvailableTargets(loadedTargets);
                
                // Auto-sélection des cibles selon le rôle
                const code = access?.role.code;
                const shouldAutoSelect = ['PDG', 'DCOM', 'INP', 'MNG', 'ANM'].includes(code);
                
                if (shouldAutoSelect && loadedTargets.length > 0) {
                    // CAS PARTICULIER PDG
                    if (code === 'PDG' && userOrganization) {
                        const hasParentGoals = parentGoalsByNature.subscription.length > 0 || parentGoalsByNature.collection.length > 0;
                        
                        if (hasParentGoals) {
                            // Si le réseau mère a des objectifs: pré-sélectionner les enfants et retirer le réseau mère du select
                            const filteredTargets = loadedTargets.filter(target => target.uid !== userOrganization.uid);
                            const cards = filteredTargets.map(target => ({
                                target: target,
                                natures: {
                                    subscription: {
                                        value: '',
                                        begin_date: parentGoalsByNature.subscription.length === 1 ? extractDatePart(parentGoalsByNature.subscription[0].begin_date) : '',
                                        end_date: parentGoalsByNature.subscription.length === 1 ? extractDatePart(parentGoalsByNature.subscription[0].end_date) : '',
                                        parent: parentGoalsByNature.subscription.length === 1 ? parentGoalsByNature.subscription[0] : null
                                    },
                                    collection: {
                                        value: '',
                                        begin_date: parentGoalsByNature.collection.length === 1 ? extractDatePart(parentGoalsByNature.collection[0].begin_date) : '',
                                        end_date: parentGoalsByNature.collection.length === 1 ? extractDatePart(parentGoalsByNature.collection[0].end_date) : '',
                                        parent: parentGoalsByNature.collection.length === 1 ? parentGoalsByNature.collection[0] : null
                                    }
                                }
                            }));
                            setTargets(filteredTargets);
                            setTargetCards(cards);
                            setAvailableTargets(filteredTargets);
                        } else {
                            // Si pas d'objectifs parent: pré-sélectionner le réseau mère et désactiver le select
                            const cards = [{
                                target: userOrganization,
                                natures: {
                                    subscription: { value: '', begin_date: '', end_date: '', parent: null },
                                    collection: { value: '', begin_date: '', end_date: '', parent: null }
                                }
                            }];
                            setTargets([userOrganization]);
                            setTargetCards(cards);
                        }
                    } else {
                        // CAS STANDARD : Préselectionner les cibles enfants
                        const cards = loadedTargets.map(target => ({
                            target: target,
                            natures: {
                                subscription: { 
                                    value: '', 
                                    begin_date: parentGoalsByNature.subscription.length === 1 ? extractDatePart(parentGoalsByNature.subscription[0].begin_date) : '', 
                                    end_date: parentGoalsByNature.subscription.length === 1 ? extractDatePart(parentGoalsByNature.subscription[0].end_date) : '', 
                                    parent: parentGoalsByNature.subscription.length === 1 ? parentGoalsByNature.subscription[0] : null 
                                },
                                collection: { 
                                    value: '', 
                                    begin_date: parentGoalsByNature.collection.length === 1 ? extractDatePart(parentGoalsByNature.collection[0].begin_date) : '', 
                                    end_date: parentGoalsByNature.collection.length === 1 ? extractDatePart(parentGoalsByNature.collection[0].end_date) : '', 
                                    parent: parentGoalsByNature.collection.length === 1 ? parentGoalsByNature.collection[0] : null 
                                }
                            }
                        }));
                        setTargets(loadedTargets);
                        setTargetCards(cards);
                    }
                } else {
                    // Pas d'auto-sélection (ADMIN, APPORTEUR)
                    setTargets([]);
                    setTargetCards([]);
                }
            } catch (e) {
                AuthService.formatFetchErrorMsgAndLogout(e.message, context, router);
            } finally {
                setInLoading(false);
            }
        };
        
        loadTargets();
    }, [selectedType?.name, organizationLoaded]);

    const isRootNetwork = (target) => {
        if (!target) return false;
        const isNetwork = selectedType?.name === 'network';
        const hasNoParent = !target.parent || target.parent === null || target.parent === '';
        return isNetwork && hasNoParent;
    };

    const isNetworkType = (target) => {
        return target?.type === 'network' || target?.target_type === 'network';
    };

    const hasRootNetworkSelected = () => {
        return targetCards.some(card => card.target && isRootNetwork(card.target));
    };

    const addTarget = (target) => {
        if (!target || !target.uid) {
            Toast.warning(t("invalidTarget"));
            return;
        }
        
        if (targetCards.some(card => card.target?.uid === target.uid)) {
            Toast.warning(t("targetAlreadyAdded"));
            return;
        }
        
        const isRoot = isRootNetwork(target);
        
        // Si c'est un réseau racine, supprimer toutes les autres cibles existantes
        if (isRoot) {
            if (targetCards.length > 0) {
                Toast.success(t("rootNetworkReplacesOthers"));
            }
            
            const newCard = {
                target: target,
                natures: {
                    subscription: { 
                        value: '', 
                        begin_date: parentGoalsByNature.subscription.length === 1 ? extractDatePart(parentGoalsByNature.subscription[0].begin_date) : '', 
                        end_date: parentGoalsByNature.subscription.length === 1 ? extractDatePart(parentGoalsByNature.subscription[0].end_date) : '', 
                        parent: parentGoalsByNature.subscription.length === 1 ? parentGoalsByNature.subscription[0] : null 
                    },
                    collection: { 
                        value: '', 
                        begin_date: parentGoalsByNature.collection.length === 1 ? extractDatePart(parentGoalsByNature.collection[0].begin_date) : '', 
                        end_date: parentGoalsByNature.collection.length === 1 ? extractDatePart(parentGoalsByNature.collection[0].end_date) : '', 
                        parent: parentGoalsByNature.collection.length === 1 ? parentGoalsByNature.collection[0] : null 
                    }
                }
            };
            
            setTargets([target]);
            setTargetCards([newCard]);
        } else {
            // Si ce n'est pas un réseau racine, vérifier si un réseau racine existe déjà
            if (hasRootNetworkSelected()) {
                Toast.warning(t("cannotAddWithRootNetwork"));
                return;
            }
            
            const newCard = {
                target: target,
                natures: {
                    subscription: { 
                        value: '', 
                        begin_date: parentGoalsByNature.subscription.length === 1 ? extractDatePart(parentGoalsByNature.subscription[0].begin_date) : '', 
                        end_date: parentGoalsByNature.subscription.length === 1 ? extractDatePart(parentGoalsByNature.subscription[0].end_date) : '', 
                        parent: parentGoalsByNature.subscription.length === 1 ? parentGoalsByNature.subscription[0] : null 
                    },
                    collection: { 
                        value: '', 
                        begin_date: parentGoalsByNature.collection.length === 1 ? extractDatePart(parentGoalsByNature.collection[0].begin_date) : '', 
                        end_date: parentGoalsByNature.collection.length === 1 ? extractDatePart(parentGoalsByNature.collection[0].end_date) : '', 
                        parent: parentGoalsByNature.collection.length === 1 ? parentGoalsByNature.collection[0] : null 
                    }
                }
            };
            
            setTargets(prev => [...prev, target]);
            setTargetCards(prev => [...prev, newCard]);
        }
        
        Toast.success(t("targetAdded"));
    };

    // Retirer une cible du processus
    const removeTarget = (index) => {
        setTargetCards(prev => prev.filter((_, i) => i !== index));
        setTargets(prev => prev.filter((_, i) => i !== index));
        Toast.success(t("targetRemoved"));
    };

    // Calculer la valeur restante pour un parent donné
    const getRemainingValue = (parentUid, currentCardIndex, nature = null) => {
        if (!parentUid) return 0;
        
        const card = targetCards[currentCardIndex];
        if (!card) return 0;
        
        let parent = null;
        let parentValue = 0;
        
        // Si la carte utilise la structure multi-natures
        if (card.natures && nature) {
            // Chercher le parent dans parentGoalsByNature
            parent = parentGoalsByNature[nature]?.find(g => g.uid === parentUid);
            if (!parent) return 0;
            parentValue = parseFloat(parent.value) || 0;
            
            // Calculer la somme des valeurs des autres cards qui ont le même parent pour cette nature
            const usedValue = targetCards.reduce((sum, card, idx) => {
                if (idx !== currentCardIndex && card.natures && card.natures[nature]?.parent?.uid === parentUid && card.natures[nature]?.value) {
                    return sum + (parseFloat(card.natures[nature].value) || 0);
                }
                return sum;
            }, 0);
            
            return Math.max(0, parentValue - usedValue);
        } else {
            // Ancien format (pour compatibilité)
            if (!card.businessGoals) return 0;
            
            parent = card.businessGoals.find(g => g.uid === parentUid);
            if (!parent) return 0;
            
            parentValue = parseFloat(parent.value) || 0;
            
            // Calculer la somme des valeurs des autres cards qui ont le même parent
            const usedValue = targetCards.reduce((sum, card, idx) => {
                if (idx !== currentCardIndex && card.parent?.uid === parentUid && card.value) {
                    return sum + (parseFloat(card.value) || 0);
                }
                return sum;
            }, 0);
            
            return Math.max(0, parentValue - usedValue);
        }
    };

    // Fonction utilitaire pour extraire la date yyyy-MM-dd de différents formats
    const extractDatePart = (dateString) => {
        if (!dateString || typeof dateString !== 'string') return '';
        // Gère '2025-01-01 00:00:00' ou '2025-01-01T00:00:00' ou '2025-01-01'
        // Ou même si la date est déjà au bon format
        const trimmed = dateString.trim();
        if (trimmed.length === 10) return trimmed; // Déjà au format yyyy-MM-dd
        if (trimmed.length > 10) {
            return trimmed.substring(0, 10); // Prend les 10 premiers caractères (yyyy-MM-dd)
        }
        return trimmed;
    };

    const updateCard = (index, nature, field, value) => {
        setTargetCards(prev => {
            const updated = [...prev];
            
            if (updated[index].natures) {
                if (!updated[index].natures[nature]) {
                    updated[index].natures[nature] = {};
                }
                updated[index].natures[nature][field] = value;
                
                // Si on change le parent, pré-remplir les dates
                if (field === 'parent' && value) {
                    if (value.begin_date) {
                        updated[index].natures[nature].begin_date = extractDatePart(value.begin_date);
                    }
                    if (value.end_date) {
                        updated[index].natures[nature].end_date = extractDatePart(value.end_date);
                    }
                }
            } else {
                updated[index][field] = value;
                
                if (field === 'parent' && value) {
                    if (value.begin_date) {
                        updated[index].begin_date = extractDatePart(value.begin_date);
                    }
                    if (value.end_date) {
                        updated[index].end_date = extractDatePart(value.end_date);
                    }
                }
            }
            
            return updated;
        });
    };


    const resetAll = () => {
        setTargetCards(prev => prev.map(card => ({
            ...card,
            value: '',
            begin_date: '',
            end_date: ''
        })));
        Toast.info(t("allFieldsReset"));
    };

    const validateCards = () => {
        const errors = [];

        // Calculer la somme des valeurs par parent (uniquement pour les objectifs avec parent)
        const parentSums = {};
        targetCards.forEach((card) => {
            if (card.natures) {
                Object.keys(card.natures).forEach(nature => {
                    const natureData = card.natures[nature];
                    if (natureData.parent && natureData.value) {
                        const parentUid = natureData.parent.uid;
                        if (!parentSums[parentUid]) {
                            parentSums[parentUid] = { sum: 0, parent: natureData.parent };
                        }
                        parentSums[parentUid].sum += parseFloat(natureData.value) || 0;
                    }
                });
            } else {
                // Ancien format pour compatibilité
                if (card.parent && card.value) {
                    const parentUid = card.parent.uid;
                    if (!parentSums[parentUid]) {
                        parentSums[parentUid] = { sum: 0, parent: card.parent };
                    }
                    parentSums[parentUid].sum += parseFloat(card.value) || 0;
                }
            }
        });

        // Vérifier que la somme ne dépasse pas la valeur du parent
        Object.entries(parentSums).forEach(([parentUid, data]) => {
            const parentValue = parseFloat(data.parent.value) || 0;
            if (data.sum > parentValue) {
                const parentLabel = formatBussinessLabel(
                    data.parent?.target?.name || data.parent?.target?.code || '',
                    data.parent?.nature || '',
                    data.parent?.value || '',
                    data.parent?.end_date || '',
                    data.parent?.description || ''
                );
                errors.push(`${t("sumOfValuesExceedsParent")}: ${parentLabel} (${data.sum} > ${parentValue})`);
            }
        });

        targetCards.forEach((card, index) => {
            if (card.natures) {
                // Nouveau format multi-natures
                let hasAtLeastOneNature = false;

                Object.keys(card.natures).forEach(nature => {
                    const natureData = card.natures[nature];
                    const natureLabel = t(nature);

                    if (natureData.value) {
                        hasAtLeastOneNature = true;

                        if (parseFloat(natureData.value) <= 0) {
                            errors.push(`${t("target")} ${index + 1} (${natureLabel}): ${t("valueRequired")}`);
                        }
                        if (!natureData.begin_date) {
                            errors.push(`${t("target")} ${index + 1} (${natureLabel}): ${t("startDateRequired")}`);
                        }
                        if (!natureData.end_date) {
                            errors.push(`${t("target")} ${index + 1} (${natureLabel}): ${t("endDateRequired")}`);
                        }
                        if (natureData.begin_date && natureData.end_date && new Date(natureData.begin_date) >= new Date(natureData.end_date)) {
                            errors.push(`${t("target")} ${index + 1} (${natureLabel}): ${t("startDateCannotBeAfterOrEqualEndDate")}`);
                        }
                        // Vérifier que les dates sont dans la plage du parent (uniquement si un parent est sélectionné)
                        if (natureData.parent && natureData.begin_date && natureData.end_date) {
                            const parentStart = new Date(natureData.parent.begin_date).setHours(0, 0, 0, 0);
                            const parentEnd = new Date(natureData.parent.end_date).setHours(0, 0, 0, 0);
                            const childStart = new Date(natureData.begin_date).setHours(0, 0, 0, 0);
                            const childEnd = new Date(natureData.end_date).setHours(0, 0, 0, 0);

                            if (childStart < parentStart || childEnd > parentEnd) {
                                errors.push(`${t("target")} ${index + 1} (${natureLabel}): ${t("datesMustBeWithinParent")}`);
                            }
                        }
                    }
                });

                if (!hasAtLeastOneNature) {
                    errors.push(`${t("target")} ${index + 1}: ${t("pleaseFillAtLeastOneNature")}`);
                }
            } else {
                // Ancien format pour compatibilitéque
                if (!card.parent && !isRootNetwork(card.target)) {
                    errors.push(`${t("target")} ${index + 1}: ${t("parentRequired")}`);
                }
                if (!card.value || card.value <= 0) {
                    errors.push(`${t("target")} ${index + 1}: ${t("valueRequired")}`);
                }
                if (!card.begin_date) {
                    errors.push(`${t("target")} ${index + 1}: ${t("startDateRequired")}`);
                }
                if (!card.end_date) {
                    errors.push(`${t("target")} ${index + 1}: ${t("endDateRequired")}`);
                }
                if (card.begin_date && card.end_date && new Date(card.begin_date) >= new Date(card.end_date)) {
                    errors.push(`${t("target")} ${index + 1}: ${t("startDateCannotBeAfterOrEqualEndDate")}`);
                }
                // Vérifier que les dates sont dans la plage du parent (uniquement si un parent est sélectionné)
                if (card.parent && card.begin_date && card.end_date) {
                    const parentStart = new Date(card.parent.begin_date).setHours(0, 0, 0, 0);
                    const parentEnd = new Date(card.parent.end_date).setHours(0, 0, 0, 0);
                    const childStart = new Date(card.begin_date).setHours(0, 0, 0, 0);
                    const childEnd = new Date(card.end_date).setHours(0, 0, 0, 0);

                    if (childStart < parentStart || childEnd > parentEnd) {
                        errors.push(`${t("target")} ${index + 1}: ${t("datesMustBeWithinParent")}`);
                    }
                }
            }
        });
        return errors;
    };

    const onFinalSubmit = async () => {
        if (targetCards.length === 0) {
            Toast.error(t("pleaseAddAtLeastOneTarget"));
            return;
        }

        const validationErrors = validateCards();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setInProgress(true);
            setErrors([]);

            const payload = buildBulkCreatePayload(targetCards, selectedType, description);

            if (payload.objectives.length === 0) {
                Toast.error(t("pleaseFillAtLeastOneObjective"));
                setInProgress(false);
                return;
            }

            console.log('PAYLOAD DATA: ', payload)
            const result = await BusinessGoal.bulkCreate(token, payload, setErrors);
            
            // Logs pour l'analyse
            logBulkCreateResults(result, targetCards);
            
            // Nouveau format API avec results détaillés par nature
            if (result.data && result.data.results) {
                const { targets_to_remove, natures_to_remove, success_count, error_count } = result.data;
                
                // Traiter les erreurs avec le helper
                const { errorMessages, errorsByCard } = processBulkCreateResults(result.data, targetCards, t);
                
                console.log('Processed error messages:', errorMessages);
                
                // Afficher les erreurs détaillées dans l'alerte globale
                if (errorMessages.length > 0) {
                    setErrors(errorMessages);
                }
                
                // Mettre à jour les cartes avec le helper
                const updatedCards = updateCardsAfterBulkCreate(
                    targetCards, 
                    targets_to_remove, 
                    natures_to_remove, 
                    errorsByCard
                );
                
                setTargetCards(updatedCards);
                
                // Afficher le Toast approprié
                if (error_count === 0) {
                    Toast.success(result.message || t("objectivesCreatedSuccessfully"));
                    context.togglePageLoading(true);
                    const url = new URL(`${window.location.origin}${BUSINESS_GOAL_LIST}`);
                    const params = new URLSearchParams(url.search);
                    params.set("value", "obj");
                    url.search = params.toString();
                    router.push(url.toString());
                } else if (success_count === 0) {
                    Toast.error(t("All objectives failed to create."));
                } else {
                    Toast.success(t("Partial success: :success objectives created, :error failed.", {
                        success: success_count,
                        error: error_count
                    }));
                }
            } else if (result.data && result.data.errors && result.data.errors.length > 0) {
                // Ancien format avec data.errors
                console.log('OLD FORMAT - errors:', result.data.errors);
                const errorMessages = result.data.errors.map(err => 
                    `Cible ${err.index + 1}: ${err.error}` 
                );
                setErrors(errorMessages);
                Toast.error(t("All objectives failed to create."));
            } else {
                // Tous les objectifs ont été créés avec succès
                console.log('SUCCESS - no errors');
                Toast.success(result.message || t("objectivesCreatedSuccessfully"));
                context.togglePageLoading(true);
                const url = new URL(`${window.location.origin}${BUSINESS_GOAL_LIST}`);
                const params = new URLSearchParams(url.search);
                params.set("value", "obj");
                url.search = params.toString();
                router.push(url.toString());
            }
        } catch (e) {
            AuthService.formatFetchErrorMsgAndLogout(e.message, context, router);
        } finally {
            setInProgress(false);
        }
    };

    return (
        <>
            <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                color="secondary"
                onClick={() => {
                    router.back();
                }}
                sx={{mb: 2}}>
                {t("back")}
            </Button>

            <PageLoadingIndicator visible={pageLoading} />
            <ActivityIndicator visible={inProgress || inLoading} />

            <Paper elevation={3} sx={{padding: "32px", mb: 4, borderRadius: 2}} className="brSm">
                <Box sx={{mb: 4}}>
                    <Typography variant="h4" component="h4" mb={1} fontWeight={600} color="primary">
                        {t("bulkCreateBusinessObjectives")}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t("generalInformation")}
                    </Typography>
                </Box>

                <Grid container mb={6}>
                    <Grid xs={12} md={6} display='none'>
                        <Controller
                            name="type"
                            control={formControl}
                            render={({field: {onChange, value}}) => (
                                <Autocomplete
                                    id="type"
                                    onChange={(_, item) => onChange(item)}
                                    value={value}
                                    options={BusinessGoal.types(t)}
                                    getOptionLabel={option => option.label}
                                    isOptionEqualToValue={(option, value) => option.name === value.name}
                                    fullWidth
                                    disabled={formSubmitting}
                                    renderInput={params => (
                                        <TextField
                                            {...params}
                                            label={t("objectiveType")}
                                            variant="filled"
                                            helperText={formErrors.type?.message}
                                            error={!!formErrors.type}
                                            required
                                        />
                                    )}
                                />
                            )}
                        />
                    </Grid>

                    <Grid xs={12}>
                        <Controller
                            name="description"
                            control={formControl}
                            render={({field: {onChange, value}}) => (
                                <TextField
                                    variant="filled"
                                    id="description"
                                    label={t("description")}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={value}
                                    onChange={onChange}
                                    disabled={formSubmitting}
                                    placeholder={t("enterDescription")}
                                />
                            )}
                        />
                    </Grid>
                </Grid>

                <Box sx={{mb: 3}}>
                    <Typography variant="body1" color="text.secondary">
                        {t("configureEach")} {" "} {t(`${selectedType?.name}`)} ({targetCards.length} {t("displayed")})
                    </Typography>
                </Box>

                <ErrorAlert
                    errors={_errors}
                    onClose={() => setErrors([])}
                    t={t}
                />

                {hasRootNetworkSelected() && (
                    <Alert severity="info" icon={<InfoIcon />} sx={{mb: 3, borderRadius: 2}}>
                        {t("rootNetworkMotherInfo")}
                    </Alert>
                )}

                <TargetSelector
                    availableTargets={availableTargets}
                    targetCards={targetCards}
                    onAddTarget={addTarget}
                    isRootNetwork={isRootNetwork}
                    hasRootNetworkSelected={hasRootNetworkSelected}
                    globalActions={targetCards.length > 0 ? <GlobalActions onReset={resetAll} t={t} /> : null}
                    t={t}
                    disabled={
                        hasRootNetworkSelected() ||
                        (access?.role.code === 'PDG' && 
                            parentGoalsByNature.subscription.length === 0 && 
                            parentGoalsByNature.collection.length === 0 &&
                            targetCards.some(card => card.target?.uid === userOrganization?.uid))
                    }
                    type={selectedType?.name}
                />

                {/* Grid des cartes avec disposition responsive multi-colonnes */}
                <Grid container spacing={3} sx={{ mt: 1 }}>
                    {targetCards.map((card, index) => {
                        const code = access?.role.code;
                        const shouldUseMultiNature = ['PDG', 'DCOM', 'INP', 'MNG', 'ANM'].includes(code) && card.natures;
                        
                        return (
                            <Grid item xs={12} sm={6} lg={4} key={index} sx={{ display: 'flex' }}>
                                {shouldUseMultiNature ? (
                                    <TargetCardMultiNature
                                        card={card}
                                        index={index}
                                        totalCards={targetCards.length}
                                        onUpdate={updateCard}
                                        onRemove={removeTarget}
                                        parentGoalsByNature={parentGoalsByNature}
                                        getRemainingValue={getRemainingValue}
                                        isRootNetwork={isRootNetwork}
                                        t={t}
                                        isLoading={loadingCards.has(index)}
                                    />
                                ) : (
                                    <TargetCard
                                        card={card}
                                        index={index}
                                        totalCards={targetCards.length}
                                        onUpdate={updateCard}
                                        onRemove={removeTarget}
                                        getRemainingValue={getRemainingValue}
                                        isRootNetwork={isRootNetwork}
                                        t={t}
                                        isLoading={loadingCards.has(index)}
                                    />
                                )}
                            </Grid>
                        );
                    })}
                </Grid>

                <Box display="flex" justifyContent="space-between" mt={4}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => {
                            router.back();
                        }}
                    >
                        {t("back")}
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={onFinalSubmit}
                        disabled={inProgress}
                    >
                        {t("create")}
                    </Button>
                </Box>
            </Paper>
        </>
    );
};

export default BusinessGoalBulkCreate;
